import React from 'react';

import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';

import PortfolioChart from '../PortfolioChart';

const Portfolio: React.FC = () => (
	<div>
		<div style={{ margin: 15 }}>
			<SectionHeader>
				<SectionTitle>Portfolio</SectionTitle>
			</SectionHeader>
		</div>
		<PortfolioChart />
	</div>
);

export default Portfolio;
