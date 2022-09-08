import useSynthetixQueries from '@synthetixio/queries';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
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
	futuresAccountState,
	potentialTradeDetailsState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { FlexDivCentered } from 'styles/common';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN, formatCurrency, formatDollars, formatNumber } from 'utils/formatters/number';
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
	const potentialTradeDetails = useRecoilValue(potentialTradeDetailsState);
	const { selectedAccountType } = useRecoilValue(futuresAccountState);

	const {
		orderTxn,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		onLeverageChange,
	} = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);

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
				value: formatDollars(positionDetails?.fee ?? zeroBN),
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

	const onDismiss = () => {
		setConfirmationModalOpen(false);
	};

	const handleConfirmOrder = async () => {
		if (selectedAccountType === 'cross_margin') {
			const tx = await submitCrossMarginOrder();
			if (tx?.hash) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						onLeverageChange('');
						handleRefetch('modify-position');
					},
				});
			}
		} else {
			submitIsolatedMarginOrder();
		}
		onDismiss();
	};

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
						isRounded
						noOutline
						onClick={handleConfirmOrder}
						disabled={!positionDetails}
					>
						{t('futures.market.trade.confirmation.modal.confirm-order')}
					</ConfirmTradeButton>
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
							isRounded
							onClick={handleConfirmOrder}
							disabled={!positionDetails}
						>
							{t('futures.market.trade.confirmation.modal.confirm-order')}
						</MobileConfirmTradeButton>
					}
				/>
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

export const MobileConfirmTradeButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 45px;
	width: 100%;
`;

export default TradeConfirmationModal;
