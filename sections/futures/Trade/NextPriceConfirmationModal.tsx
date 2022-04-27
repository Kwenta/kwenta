import { FC, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import BaseModal from 'components/BaseModal';
import { gasSpeedState } from 'store/wallet';

import { FlexDivCol, FlexDivCentered } from 'styles/common';
import Button from 'components/Button';
import { newGetTransactionPrice } from 'utils/network';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import { zeroBN, formatCurrency } from 'utils/formatters/number';
import { PositionSide } from '../types';
import { GasLimitEstimate } from 'constants/network';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';

type NextPriceConfirmationModalProps = {
	onDismiss: () => void;
	market: string | null;
	tradeSize: string;
	gasLimit: GasLimitEstimate;
	onConfirmOrder: () => void;
	side: PositionSide;
	l1Fee: Wei | null;
	feeCost: Wei | null;
	positionSize: Wei | null;
};

const NextPriceConfirmationModal: FC<NextPriceConfirmationModalProps> = ({
	onDismiss,
	market,
	tradeSize,
	side,
	gasLimit,
	onConfirmOrder,
	l1Fee,
	feeCost,
	positionSize,
}) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const nextPriceDetailsQuery = useGetNextPriceDetails(market);

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;
	const nextPriceDetails = nextPriceDetailsQuery?.data;

	const transactionFee = useMemo(
		() => newGetTransactionPrice(gasPrice, gasLimit, ethPriceRate, l1Fee),
		[gasPrice, gasLimit, ethPriceRate, l1Fee]
	);

	const orderDetails = useMemo(() => {
		const newSize = side === PositionSide.LONG ? tradeSize : -tradeSize;

		return { size: (positionSize ?? zeroBN).add(newSize) };
	}, [side, tradeSize, positionSize]);

	const dataRows = useMemo(
		() => [
			{ label: 'Side', value: (side ?? PositionSide.LONG).toUpperCase() },
			{
				label: 'Size',
				value: formatCurrency(market || '', orderDetails.size ?? zeroBN, {
					sign: market ? synthsMap[market]?.sign : '',
				}),
			},
			{
				label: 'Keeper Deposit',
				value: formatCurrency(Synths.sUSD, nextPriceDetails?.keeperDeposit ?? zeroBN, {
					sign: '$',
				}),
			},
			{
				label: 'Commit Deposit',
				value: formatCurrency(Synths.sUSD, feeCost ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'Total Fee',
				value: formatCurrency(
					Synths.sUSD,
					(nextPriceDetails?.keeperDeposit ?? zeroBN).add(feeCost ?? zeroBN),
					{ sign: '$' }
				),
			},
		],
		[orderDetails, market, synthsMap, nextPriceDetails?.keeperDeposit, side, feeCost]
	);

	const handleConfirmOrder = async () => {
		onConfirmOrder();
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
			<NetworkFees>
				<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
			</NetworkFees>
			<ConfirmTradeButton variant="primary" isRounded onClick={handleConfirmOrder}>
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
	border-bottom: 1px solid ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
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

export default NextPriceConfirmationModal;
