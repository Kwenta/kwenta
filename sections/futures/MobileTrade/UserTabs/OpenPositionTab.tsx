import React from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import OrderSizing from 'sections/futures/OrderSizing';
import LeverageInput from 'sections/futures/LeverageInput';

import { leverageSideState, orderTypeState } from 'store/futures';
import ManagePosition from 'sections/futures/Trade/ManagePosition';
import FeeInfoBox from 'sections/futures/FeeInfoBox';
import NextPrice from 'sections/futures/Trade/NextPrice';
import TradeConfirmationDrawer from '../drawers/TradeConfirmationDrawer';
import { useFuturesContext } from 'contexts/FuturesContext';

const OpenPositionTab: React.FC = () => {
	const [modalOpen, setModalOpen] = React.useState(false);

	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);

	const {
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		onLeverageChange,
		isMarketCapReached,
		placeOrderTranslationKey,
		dynamicFee,
		error,
		orderTxn,
	} = useFuturesContext();

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
				error={error}
				orderError={orderTxn.errorMessage}
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
