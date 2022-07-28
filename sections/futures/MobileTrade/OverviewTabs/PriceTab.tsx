import React from 'react';
import styled from 'styled-components';

import TVChart from 'components/TVChart';

import { Pane } from '../common';

const PriceTab: React.FC = () => {
	return (
		<StyledPane noPadding>
			<TVChart />
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
