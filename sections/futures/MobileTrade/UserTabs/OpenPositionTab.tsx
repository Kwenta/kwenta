import React from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import OrderSizing from 'sections/futures/OrderSizing';
import LeverageInput from 'sections/futures/LeverageInput';

import { leverageSideState, orderTypeState } from 'store/futures';
import useFuturesData from 'hooks/useFuturesData';
import ManagePosition from 'sections/futures/Trade/ManagePosition';
import FeeInfoBox from 'sections/futures/FeeInfoBox';
import NextPrice from 'sections/futures/Trade/NextPrice';

const OpenPositionTab: React.FC = () => {
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);

	const {
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		onLeverageChange,
		isFuturesMarketClosed,
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

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} isMarketClosed={false} />

			<OrderSizing
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={onLeverageChange}
			/>

			<LeverageInput onLeverageChange={onLeverageChange} isMarketClosed={isFuturesMarketClosed} />

			<ManagePosition
				marketCapReached={isMarketCapReached}
				translationKey={placeOrderTranslationKey}
				openConfirmationModal={() => {}}
				openClosePositionModal={() => {}}
				error={error}
				marketClosed={isFuturesMarketClosed}
			/>

			<FeeInfoBox dynamicFee={dynamicFee} />
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;
