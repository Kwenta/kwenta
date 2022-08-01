import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import { Synths } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import {
	currentMarketState,
	leverageSideState,
	nextPriceDisclaimerState,
	positionState,
	tradeSizeState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { FlexDivCol, FlexDivCentered } from 'styles/common';
import { computeNPFee } from 'utils/costCalculations';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN, formatCurrency } from 'utils/formatters/number';
import { newGetTransactionPrice } from 'utils/network';

import { PositionSide } from '../types';

type NextPriceConfirmationModalProps = {
	onDismiss: () => void;
};

const NextPriceConfirmationModal: FC<NextPriceConfirmationModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const isDisclaimerDisplayed = useRecoilValue(nextPriceDisclaimerState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const nextPriceDetailsQuery = useGetNextPriceDetails();

	const tradeSize = useRecoilValue(tradeSizeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(currentMarketState);

	const { orderTxn } = useFuturesContext();

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
		() =>
			newGetTransactionPrice(
				gasPrice,
				orderTxn.gasLimit,
				ethPriceRate,
				orderTxn.optimismLayerOneFee
			),
		[gasPrice, orderTxn.gasLimit, ethPriceRate, orderTxn.optimismLayerOneFee]
	);

	const positionSize = position?.position?.size ?? zeroBN;

	const orderDetails = useMemo(() => {
		const newSize = leverageSide === PositionSide.LONG ? wei(tradeSize) : wei(tradeSize).neg();

		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
	}, [leverageSide, tradeSize, positionSize]);

	const { commitDeposit, nextPriceFee } = useMemo(
		() => computeNPFee(nextPriceDetails, wei(orderDetails.newSize)),
		[nextPriceDetails, orderDetails]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(nextPriceDetails?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceDetails?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const dataRows = useMemo(
		() => [
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: t('futures.market.user.position.modal.next-price-order'),
			},
			{
				label: t('futures.market.user.position.modal.side'),
				value: (leverageSide ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal.size'),
				value: formatCurrency(market || '', orderDetails.newSize.abs() ?? zeroBN, {
					sign: market ? synthsMap[market]?.sign : '',
				}),
			},
			{
				label: t('futures.market.user.position.modal.deposit'),
				value: formatCurrency(Synths.sUSD, totalDeposit, { sign: '$' }),
			},
			{
				label: t('futures.market.user.position.modal.np-discount'),
				value: !!nextPriceDiscount
					? formatCurrency(Synths.sUSD, nextPriceDiscount, { sign: '$' })
					: NO_VALUE,
			},
			{
				label: t('futures.market.user.position.modal.fee-total'),
				value: formatCurrency(
					selectedPriceCurrency.name,
					totalDeposit.add(nextPriceDiscount ?? zeroBN),
					{
						minDecimals: 2,
						sign: selectedPriceCurrency.sign,
					}
				),
			},
		],
		[
			t,
			orderDetails,
			market,
			synthsMap,
			leverageSide,
			nextPriceDiscount,
			totalDeposit,
			selectedPriceCurrency.name,
			selectedPriceCurrency.sign,
		]
	);

	const handleConfirmOrder = async () => {
		orderTxn.mutate();
		onDismiss();
	};

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen
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
			{isDisclaimerDisplayed && (
				<Disclaimer>
					{t('futures.market.trade.confirmation.modal.max-leverage-disclaimer')}
				</Disclaimer>
			)}
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

const NetworkFees = styled(FlexDivCol)`
	margin-top: 12px;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
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

const Disclaimer = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-top: 12px;
	margin-bottom: 12px;
`;

export default NextPriceConfirmationModal;
