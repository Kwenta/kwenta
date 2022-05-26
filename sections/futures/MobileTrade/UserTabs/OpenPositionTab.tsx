import React from 'react';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import { PositionSide } from 'sections/futures/types';

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
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;
