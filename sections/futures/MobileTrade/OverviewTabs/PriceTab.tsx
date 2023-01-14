import React from 'react';
import styled from 'styled-components';

import { Pane } from 'components/mobile/futures';
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
		min-height: 313px;
		max-height: 313px;
	}

	iframe {
		max-height: 313px;
	}
`;

export default PriceTab;
