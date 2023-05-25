import React from 'react';
import styled from 'styled-components';

import { Pane } from 'sections/futures/mobile';
import PositionChart from 'sections/futures/PositionChart';

const PriceTab: React.FC = () => {
	return (
		<StyledPane noPadding>
			<PositionChart />
		</StyledPane>
	);
};

const StyledPane = styled(Pane)`
	#tv_chart_container {
		min-height: 324px;
		max-height: 324px;
	}

	iframe {
		max-height: 324px;
	}
`;

export default PriceTab;
