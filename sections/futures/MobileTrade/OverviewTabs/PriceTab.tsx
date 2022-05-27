import React from 'react';
import styled from 'styled-components';
import TVChart from 'components/TVChart';

const PriceTab: React.FC = () => {
	return (
		<StyledPane>
			<TVChart baseCurrencyKey="sUSD" quoteCurrencyKey="sETH" />
		</StyledPane>
	);
};

const StyledPane = styled.div`
	#tv_chart_container {
		min-height: 301px;
		max-height: 301px;
	}

	iframe {
		max-height: 301px;
	}
`;

export default PriceTab;
