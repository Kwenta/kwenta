import useSynthetixQueries from '@synthetixio/queries';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import { Synths, CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { currentMarketState, potentialTradeDetailsState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { FlexDivCentered } from 'styles/common';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN, formatCurrency, formatNumber } from 'utils/formatters/number';
import { newGetTransactionPrice } from 'utils/network';

import { PositionSide } from '../types';

type TradeConfirmationModalProps = {
	onDismiss: () => void;
};

const TradeConfirmationModal: FC<TradeConfirmationModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const potentialTradeDetails = useRecoilValue(potentialTradeDetailsState);

	const { orderTxn } = useFuturesContext();

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const transactionFee = useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				orderTxn.gasLimit,
				ethPriceRate,
				orderTxn.optimismLayerOneFee
			),
		[gasPrice, orderTxn.gasLimit, ethPriceRate, orderTxn.optimismLayerOneFee]
	);

	const positionDetails = useMemo(() => {
		return potentialTradeDetails
			? {
					...potentialTradeDetails,
					size: potentialTradeDetails.size.abs(),
					side: potentialTradeDetails.size.gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					leverage: potentialTradeDetails.margin.eq(zeroBN)
						? zeroBN
						: potentialTradeDetails.size
								.mul(potentialTradeDetails.price)
								.div(potentialTradeDetails.margin)
								.abs(),
			  }
			: null;
	}, [potentialTradeDetails]);

	const dataRows = useMemo(
		() => [
			{ label: 'side', value: (positionDetails?.side ?? PositionSide.LONG).toUpperCase() },
			{
				label: 'size',
				value: formatCurrency(market || '', positionDetails?.size ?? zeroBN, {
					sign: market ? synthsMap[market]?.sign : '',
				}),
			},
			{ label: 'leverage', value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x` },
			{
				label: 'current price',
				value: formatCurrency(Synths.sUSD, positionDetails?.price ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'liquidation price',
				value: formatCurrency(Synths.sUSD, positionDetails?.liqPrice ?? zeroBN, {
					sign: '$',
				}),
			},
			{
				label: 'margin',
				value: formatCurrency(Synths.sUSD, positionDetails?.margin ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'protocol fee',
				value: formatCurrency(Synths.sUSD, positionDetails?.fee ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'network gas fee',
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee ?? zeroBN, {
					sign: '$',
					minDecimals: 2,
				}),
			},
		],
		[positionDetails, market, synthsMap, transactionFee, selectedPriceCurrency]
	);

	const handleConfirmOrder = async () => {
		orderTxn.mutate();
		onDismiss();
	};

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
			<ConfirmTradeButton
				variant="primary"
				isRounded
				onClick={handleConfirmOrder}
				disabled={!positionDetails}
			>
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
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 12px;
	margin-top: 6px;
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;

export default TradeConfirmationModal;
