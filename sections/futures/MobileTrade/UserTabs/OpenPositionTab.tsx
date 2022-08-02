import React from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import FeeInfoBox from 'sections/futures/FeeInfoBox';
import LeverageInput from 'sections/futures/LeverageInput';
import OrderSizing from 'sections/futures/OrderSizing';
import PositionButtons from 'sections/futures/PositionButtons';
import ManagePosition from 'sections/futures/Trade/ManagePosition';
import NextPrice from 'sections/futures/Trade/NextPrice';
import { leverageSideState, orderTypeState } from 'store/futures';

const OpenPositionTab: React.FC = () => {
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);

	return (
		<div>
			<StyledSegmentedControl
				selectedIndex={orderType}
				values={['Market', 'Next-Price']}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;
