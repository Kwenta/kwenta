import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Synths } from 'constants/currency';

import { zeroBN } from 'utils/formatters/number';
import { gasSpeedState, walletAddressState } from 'store/wallet';
import TransactionNotifier from 'containers/TransactionNotifier';
import SegmentedControl from 'components/SegmentedControl';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useFuturesData from 'hooks/useFuturesData';

import LeverageInput from '../LeverageInput';
import TradeConfirmationModal from './TradeConfirmationModal';
import MarketsDropdown from './MarketsDropdown';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';
import NextPrice from './NextPrice';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import ClosePositionModal from '../PositionCard/ClosePositionModal';
import {
	currentMarketState,
	leverageSideState,
	leverageState,
	orderTypeState,
	sizeDeltaState,
} from 'store/futures';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';
import RefetchContext from 'contexts/RefetchContext';

type ModalList = 'deposit' | 'withdraw' | 'trade' | 'next-price' | 'close-position';

const Trade: React.FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery, useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = React.useContext(RefetchContext);

	const {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		placeOrderTranslationKey,
		maxLeverageValue,
		error,
		dynamicFee,
		isMarketCapReached,
	} = useFuturesData();

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const leverage = useRecoilValue(leverageState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const marketAsset = useRecoilValue(currentMarketState);

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
					handleRefetch('modify-position');
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

	return (
		<div>
			<MarketsDropdown />

			<MarketActions
				openDepositModal={() => setOpenModal('deposit')}
				openWithdrawModal={() => setOpenModal('withdraw')}
			/>

			<MarketInfoBox />

			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />

			<OrderSizing
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={onLeverageChange}
			/>

			<LeverageInput onLeverageChange={onLeverageChange} />

			<ManagePosition
				translationKey={placeOrderTranslationKey}
				marketCapReached={isMarketCapReached}
				openConfirmationModal={() => setOpenModal(orderType === 1 ? 'next-price' : 'trade')}
				openClosePositionModal={() => setOpenModal('close-position')}
				error={error}
			/>

			{(orderTxn.errorMessage || error) && (
				<ErrorMessage>{orderTxn.errorMessage || error}</ErrorMessage>
			)}

			<FeeInfoBox dynamicFee={dynamicFee} />

			{openModal === 'deposit' && (
				<DepositMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'withdraw' && (
				<WithdrawMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'trade' && (
				<TradeConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'next-price' && (
				<NextPriceConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'close-position' && (
				<ClosePositionModal onDismiss={() => setOpenModal(null)} />
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
