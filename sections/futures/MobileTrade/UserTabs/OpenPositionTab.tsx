import React from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import OrderSizing from 'sections/futures/OrderSizing';
import LeverageInput from 'sections/futures/LeverageInput';

import {
	currentMarketState,
	leverageSideState,
	leverageState,
	maxLeverageState,
	orderTypeState,
	sizeDeltaState,
} from 'store/futures';
import useFuturesData from 'hooks/useFuturesData';
import ManagePosition from 'sections/futures/Trade/ManagePosition';
import FeeInfoBox from 'sections/futures/FeeInfoBox';
import NextPrice from 'sections/futures/Trade/NextPrice';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useSynthetixQueries from '@synthetixio/queries';
import { gasSpeedState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';
import TransactionNotifier from 'containers/TransactionNotifier';
import RefetchContext from 'contexts/RefetchContext';
import TradeConfirmationDrawer from '../drawers/TradeConfirmationDrawer';

const OpenPositionTab: React.FC = () => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = React.useContext(RefetchContext);

	const [modalOpen, setModalOpen] = React.useState(false);

	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const marketAsset = useRecoilValue(currentMarketState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const leverage = useRecoilValue(leverageState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);

	const { useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();

	const ethGasPriceQuery = useEthGasPriceQuery();

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

	React.useEffect(() => {
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

	const {
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		onLeverageChange,
		isMarketCapReached,
		placeOrderTranslationKey,
		dynamicFee,
		error,
	} = useFuturesData();

	return (
		<div>
			<StyledSegmentedControl
				selectedIndex={orderType}
				values={['Market', 'Next-Price']}
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
				marketCapReached={isMarketCapReached}
				translationKey={placeOrderTranslationKey}
				openConfirmationModal={() => setModalOpen(true)}
				openClosePositionModal={() => {}}
				error={error}
			/>

			<FeeInfoBox dynamicFee={dynamicFee} />

			<TradeConfirmationDrawer
				open={modalOpen}
				closeDrawer={() => setModalOpen(false)}
				gasLimit={orderTxn.gasLimit}
				l1Fee={orderTxn.optimismLayerOneFee}
				onConfirmOrder={() => orderTxn.mutate()}
			/>
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;
