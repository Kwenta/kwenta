import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import { Synths } from 'constants/currency';

import { zeroBN } from 'utils/formatters/number';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { walletAddressState } from 'store/wallet';
import TransactionNotifier from 'containers/TransactionNotifier';

import LeverageInput from '../LeverageInput';
import TradeConfirmationModal from './TradeConfirmationModal';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import MarketsDropdown from './MarketsDropdown';
import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import NextPrice from './NextPrice';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import ClosePositionModal from '../PositionCard/ClosePositionModal';
import {
	leverageSideState,
	leverageState,
	orderTypeState,
	positionState,
	sizeDeltaState,
} from 'store/futures';
import useFuturesData from 'hooks/useFuturesData';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';

type TradeProps = {
	refetch(): void;
	currencyKey: string;
};

type ModalList = 'deposit' | 'withdraw' | 'trade' | 'next-price' | 'close-position';

const Trade: React.FC<TradeProps> = ({ refetch, currencyKey }) => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery, useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const position = useRecoilValue(positionState);

	const {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		placeOrderTranslationKey,
		maxLeverageValue,
		error,
		dynamicFee,
		isMarketCapReached,
		shouldDisplayNextPriceDisclaimer,
		isFuturesMarketClosed,
		marketAsset,
		marketQuery,
		market,
	} = useFuturesData();

	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);

	const positionDetails = position?.position ?? null;

	const onPositionClose = () => {
		setTimeout(() => {
			futuresPositionHistoryQuery.refetch();
			refetch();
		}, 5 * 1000);
	};

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const leverage = useRecoilValue(leverageState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const sizeDelta = useRecoilValue(sizeDeltaState);

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);

	const [openModal, setOpenModal] = useState<ModalList | null>(null);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed];

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${marketAsset?.[0] === 's' ? marketAsset?.substring(1) : marketAsset}`,
		orderType === 1 ? 'submitNextPriceOrderWithTracking' : 'modifyPositionWithTracking',
		[sizeDelta.toBN(), KWENTA_TRACKING_CODE],
		gasPrice,
		{
			enabled:
				!!marketAsset &&
				!!leverage &&
				Number(leverage) >= 0 &&
				maxLeverageValue.gte(leverage) &&
				!sizeDelta.eq(zeroBN),
		}
	);

	useEffect(() => {
		if (orderTxn.hash) {
			monitorTransaction({
				txHash: orderTxn.hash,
				onTxConfirmed: () => {
					onLeverageChange('');
					setTimeout(async () => {
						futuresPositionHistoryQuery.refetch();
						marketQuery.refetch();
						refetch();
					}, 5 * 1000);
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

	return (
		<div>
			<MarketsDropdown asset={marketAsset || Synths.sUSD} />

			<MarketActions
				openDepositModal={() => setOpenModal('deposit')}
				openWithdrawModal={() => setOpenModal('withdraw')}
				marketClosed={isFuturesMarketClosed}
				position={position}
			/>

			<MarketInfoBox
				totalMargin={position?.remainingMargin ?? zeroBN}
				availableMargin={position?.accessibleMargin ?? zeroBN}
				buyingPower={
					position?.remainingMargin.gt(zeroBN)
						? position?.remainingMargin?.mul(market?.maxLeverage ?? zeroBN)
						: zeroBN
				}
				marginUsage={
					position?.remainingMargin.gt(zeroBN)
						? position?.remainingMargin
								?.sub(position?.accessibleMargin)
								.div(position?.remainingMargin)
						: zeroBN
				}
				isMarketClosed={isFuturesMarketClosed}
			/>

			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons
				selected={leverageSide}
				onSelect={setLeverageSide}
				isMarketClosed={isFuturesMarketClosed}
			/>

			<OrderSizing
				disabled={position?.remainingMargin?.lte(zeroBN)}
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={onLeverageChange}
				marketAsset={marketAsset || Synths.sUSD}
				maxLeverage={maxLeverageValue}
				totalMargin={position?.remainingMargin ?? zeroBN}
			/>

			<LeverageInput
				maxLeverage={maxLeverageValue}
				onLeverageChange={onLeverageChange}
				isMarketClosed={isFuturesMarketClosed}
				isDisclaimerDisplayed={orderType === 1 && shouldDisplayNextPriceDisclaimer}
			/>

			<ManagePosition
				translationKey={placeOrderTranslationKey}
				marketCapReached={isMarketCapReached}
				maxLeverageValue={maxLeverageValue}
				openConfirmationModal={() => setOpenModal(orderType === 1 ? 'next-price' : 'trade')}
				openClosePositionModal={() => setOpenModal('close-position')}
				marketClosed={isFuturesMarketClosed}
				error={error}
				onPositionClose={onPositionClose}
				positionDetails={positionDetails}
			/>

			{(orderTxn.errorMessage || error) && (
				<ErrorMessage>{orderTxn.errorMessage || error}</ErrorMessage>
			)}

			<FeeInfoBox currencyKey={marketAsset} dynamicFee={dynamicFee} />

			{openModal === 'deposit' && (
				<DepositMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={position?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							refetch();
							futuresPositionHistoryQuery.refetch();
							synthsBalancesQuery.refetch();
						}, 5 * 1000);
					}}
					market={marketAsset}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'withdraw' && (
				<WithdrawMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={position?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							refetch();
							futuresPositionHistoryQuery.refetch();
							synthsBalancesQuery.refetch();
						}, 5 * 1000);
					}}
					market={marketAsset}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'trade' && (
				<TradeConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					market={marketAsset}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'next-price' && (
				<NextPriceConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					market={marketAsset}
					onDismiss={() => setOpenModal(null)}
					positionSize={position?.position?.size ?? null}
					isDisclaimerDisplayed={shouldDisplayNextPriceDisclaimer}
				/>
			)}

			{openModal === 'close-position' && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onPositionClose={onPositionClose}
					onDismiss={() => setOpenModal(null)}
				/>
			)}
		</div>
	);
};

export default Trade;

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	margin-bottom: 16px;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;
