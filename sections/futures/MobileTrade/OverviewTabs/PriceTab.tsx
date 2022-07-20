import React from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TVChart from 'components/TVChart';
import { Synths } from 'constants/currency';
import { currentMarketState } from 'store/futures';

import { Pane } from '../common';

const PriceTab: React.FC = () => {
	const marketAsset = useRecoilValue(currentMarketState);

	return (
		<StyledPane noPadding>
			<TVChart baseCurrencyKey={marketAsset} quoteCurrencyKey={Synths.sUSD} />
		</StyledPane>
	);
};

const StyledPane = styled(Pane)`
	#tv_chart_container {
		min-height: 301px;
		max-height: 301px;
	}

	iframe {
		max-height: 301px;
	}
`;

export default PriceTab;
