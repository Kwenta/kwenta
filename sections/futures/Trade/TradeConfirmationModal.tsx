import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import {
	confirmationModalOpenState,
	currentMarketState,
	futuresAccountTypeState,
	potentialTradeDetailsState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { FlexDivCentered } from 'styles/common';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN, formatCurrency, formatDollars, formatNumber } from 'utils/formatters/number';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';

const TradeConfirmationModal: FC = () => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();

	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const {
		orderTxn,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		resetTradeState,
		tradeFees,
	} = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);

	const [error, setError] = useState<null | string>(null);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, 'sETH', selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	// TODO: Get tx fee for cross margin order
	const transactionFee = useMemo(
		() =>
			getTransactionPrice(gasPrice, orderTxn.gasLimit, ethPriceRate, orderTxn.optimismLayerOneFee),
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

	const fee = tradeFees.crossMarginFee.add(positionDetails?.fee || 0);

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
				value: formatDollars(positionDetails?.price ?? zeroBN),
			},
			{
				label: 'liquidation price',
				value: formatDollars(positionDetails?.liqPrice ?? zeroBN),
			},
			{
				label: 'margin',
				value: formatDollars(positionDetails?.margin ?? zeroBN),
			},
			{
				label: 'protocol fee',
				value: formatDollars(fee),
			},
			{
				label: 'network gas fee',
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee ?? zeroBN, {
					sign: '$',
					minDecimals: 2,
				}),
			},
		],
		[positionDetails, market, synthsMap, transactionFee, selectedPriceCurrency, fee]
	);

	const onDismiss = () => {
		setConfirmationModalOpen(false);
	};

	const handleConfirmOrder = async () => {
		setError(null);
		if (selectedAccountType === 'cross_margin') {
			try {
				const tx = await submitCrossMarginOrder();
				if (tx?.hash) {
					monitorTransaction({
						txHash: tx.hash,
						onTxFailed(failureMessage) {
							setError(failureMessage?.failureReason || t('common.transaction.transaction-failed'));
						},
						onTxConfirmed: () => {
							resetTradeState();
							handleRefetch('modify-position');
						},
					});
					onDismiss();
				}
			} catch (err) {
				if (!isUserDeniedError(err.message)) {
					logError(err);
					setError(t('common.transaction.transaction-failed'));
				}
			}
		} else {
			submitIsolatedMarginOrder();
			onDismiss();
		}
	};

	const disabledReason = useMemo(() => {
		if (positionDetails?.margin.lt(wei(50)))
			return t('futures.market.trade.confirmation.modal.disabled-min-margin');
	}, [positionDetails?.margin, t]);

	return (
		<>
			<DesktopOnlyView>
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
					<ConfirmTradeButton
						data-testid="trade-open-position-confirm-order-button"
						variant="flat"
						onClick={handleConfirmOrder}
						disabled={!positionDetails || !!disabledReason}
					>
						{disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')}
					</ConfirmTradeButton>
					{error && (
						<ErrorContainer>
							<ErrorView message={error} />
						</ErrorContainer>
					)}
				</StyledBaseModal>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BaseDrawer
					open
					closeDrawer={onDismiss}
					items={dataRows}
					buttons={
						<MobileConfirmTradeButton
							variant="primary"
							onClick={handleConfirmOrder}
							disabled={!positionDetails || !!disabledReason}
						>
							{disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')}
						</MobileConfirmTradeButton>
					}
				/>
				{error && (
					<ErrorContainer>
						<ErrorView message={error} />
					</ErrorContainer>
				)}
			</MobileOrTabletView>
		</>
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 12px;
	margin-top: 6px;
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
	font-size: 15px;
`;

export const MobileConfirmTradeButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 45px;
	width: 100%;
	font-size: 15px;
`;

const ErrorContainer = styled.div`
	margin-top: 20px;
`;

export default TradeConfirmationModal;
