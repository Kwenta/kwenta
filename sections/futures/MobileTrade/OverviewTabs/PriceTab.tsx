import React from 'react';
import TVChart from 'components/TVChart';

const PriceTab: React.FC = () => {
	return (
		<div>
			<TVChart baseCurrencyKey="sUSD" quoteCurrencyKey="sETH" />
		</div>
	);
};

export default PriceTab;
