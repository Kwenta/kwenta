import React from 'react';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import { PositionSide } from 'sections/futures/types';
import OrderSizing from 'sections/futures/OrderSizing';
import { zeroBN } from 'utils/formatters/number';
import LeverageInput from 'sections/futures/LeverageInput';

const OpenPositionTab: React.FC = () => {
	const [orderType, setOrderType] = React.useState(0);
	const [positionSide, setPositionSide] = React.useState(PositionSide.LONG);

	return (
		<div>
			<StyledSegmentedControl
				selectedIndex={orderType}
				values={['Market', 'Next-Price']}
				onChange={setOrderType}
			/>

			<PositionButtons selected={positionSide} onSelect={setPositionSide} isMarketClosed={false} />

			<OrderSizing
				marketAsset="sETH"
				onAmountChange={() => {}}
				onAmountSUSDChange={() => {}}
				onLeverageChange={() => {}}
				maxLeverage={zeroBN}
				totalMargin={zeroBN}
				disabled={false}
			/>

			<LeverageInput
				maxLeverage={zeroBN}
				onLeverageChange={() => {}}
				isMarketClosed={false}
				isDisclaimerDisplayed={false}
			/>
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;
