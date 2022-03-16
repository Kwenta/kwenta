import { FC, useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import BaseModal from 'components/BaseModal';
import { gasSpeedState } from 'store/wallet';
import { walletAddressState } from 'store/wallet';

import { FlexDivCol, FlexDivCentered } from 'styles/common';
import Button from 'components/Button';
import { getTransactionPrice } from 'utils/network';
import { getFuturesMarketContract } from 'queries/futures/utils';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import { zeroBN, formatCurrency, formatNumber } from 'utils/formatters/number';
import { PositionSide } from '../types';
import { parseGasPriceObject } from 'hooks/useGas';

type TradeConfirmationModalProps = {
	onDismiss: () => void;
	market: string | null;
	tradeSize: string;
	gasLimit: number | null;
	onConfirmOrder: () => void;
	side: PositionSide;
};

type PositionDetails = {
	fee: Wei;
	liquidationPrice: Wei;
	currentPrice: Wei;
	margin: Wei;
	leverage: Wei;
	side: PositionSide;
	size: Wei;
};

const TradeConfirmationModal: FC<TradeConfirmationModalProps> = ({
	onDismiss,
	market,
	tradeSize,
	side,
	gasLimit,
	onConfirmOrder,
}) => {
	const { t } = useTranslation();
	const { synthetixjs, synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const [positionDetails, setPositionDetails] = useState<PositionDetails | null>(null);
	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed]
		? parseGasPriceObject(ethGasPriceQuery?.data?.[gasSpeed])
		: null;

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	useEffect(() => {
		const getPositionDetails = async () => {
			if (!tradeSize || !market || !synthetixjs || !walletAddress) return;
			try {
				const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
				const newSize = side === PositionSide.LONG ? tradeSize : -tradeSize;
				const { fee, liqPrice, margin, price, size } = await FuturesMarketContract.postTradeDetails(
					wei(newSize).toBN(),
					walletAddress
				);
				setPositionDetails({
					fee: wei(fee),
					liquidationPrice: wei(liqPrice),
					margin: wei(margin),
					currentPrice: wei(price),
					size: wei(size).abs(),
					side: wei(size).gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					leverage: wei(margin).eq(zeroBN)
						? zeroBN
						: wei(size).mul(wei(price)).div(wei(margin)).abs(),
				});
			} catch (e) {
				// @ts-ignore
				console.log(e.message);
			}
		};
		getPositionDetails();
	}, [market, synthetixjs, tradeSize, walletAddress, side]);

	const dataRows = useMemo(
		() => [
			{ label: 'side', value: (positionDetails?.side ?? PositionSide.LONG).toUpperCase() },
			{
				label: 'size',
				value: formatCurrency(market || '', positionDetails?.size ?? zeroBN, {
					sign: market ? synthsMap[market].sign : ''
				}),
			},
			{ label: 'leverage', value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x` },
			{
				label: 'current price',
				value: formatCurrency(Synths.sUSD, positionDetails?.currentPrice ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'liquidation price',
				value: formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
					sign: '$',
				}),
			},
			{
				label: 'margin',
				value: formatCurrency(Synths.sUSD, positionDetails?.margin ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'fee',
				value: formatCurrency(Synths.sUSD, positionDetails?.fee ?? zeroBN, { sign: '$' }),
			},
		],
		[positionDetails, market]
	);

	const handleConfirmOrder = async () => {
		onConfirmOrder();
		onDismiss();
	};
	console.log(synthsMap)

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('futures.market.trade.confirmation.modal.confirm-order')}
		>
			{dataRows.map(({ label, value }, i) => (
				<Row key={`datarow-${i}`}>
					<Label>{label}</Label>
					<Value>{value}</Value>
				</Row>
			))}
			<NetworkFees>
				<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
			</NetworkFees>
			<ConfirmTradeButton isRounded onClick={handleConfirmOrder} disabled={!positionDetails}>
				{t('futures.market.trade.confirmation.modal.confirm-order')}
			</ConfirmTradeButton>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 28px;
	}
`;

const Row = styled(FlexDivCentered)`
	justify-content: space-between;
`;

const Label = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	margin-top: 6px;
`;

const NetworkFees = styled(FlexDivCol)`
	margin-top: 12px;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;

export default TradeConfirmationModal;
