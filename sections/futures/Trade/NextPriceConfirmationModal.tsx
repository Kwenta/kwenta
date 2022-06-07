import { FC, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
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
import { computeNPFee } from 'utils/costCalculations';
import { NO_VALUE } from 'constants/placeholder';
import { getMarketKey } from 'utils/futures';

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
	isDisclaimerDisplayed: boolean;
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
	isDisclaimerDisplayed,
}) => {
	const { t } = useTranslation();
	const { synthsMap, network } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const nextPriceDetailsQuery = useGetNextPriceDetails(getMarketKey(market, network.id));

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

		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
	}, [side, tradeSize, positionSize]);

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
			{ label: 'Side', value: (side ?? PositionSide.LONG).toUpperCase() },
			{
				label: 'Size',
				value: formatCurrency(market || '', orderDetails.size ?? zeroBN, {
					sign: market ? synthsMap[market]?.sign : '',
				}),
			},
			{
				label: 'Total Deposit',
				value: formatCurrency(Synths.sUSD, totalDeposit, { sign: '$' }),
			},
			{
				label: 'Next-Price Discount',
				value: !!nextPriceDiscount
					? formatCurrency(Synths.sUSD, nextPriceDiscount, { sign: '$' })
					: NO_VALUE,
			},
			{
				label: 'Estimated Fees',
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
			orderDetails,
			market,
			synthsMap,
			side,
			nextPriceDiscount,
			totalDeposit,
			selectedPriceCurrency.name,
			selectedPriceCurrency.sign,
		]
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
