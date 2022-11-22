import React from 'react';
import { useTranslation } from 'react-i18next';

import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';

import PortfolioChart from '../PortfolioChart';

type PortfolioProps = {
	exchangeTokenBalances?: number;
};

const Portfolio: React.FC<PortfolioProps> = ({ exchangeTokenBalances = 0 }) => {
	const { t } = useTranslation();

	return (
		<div>
			<div style={{ margin: 15 }}>
				<SectionHeader>
					<SectionTitle>{t('dashboard.overview.mobile.portfolio')}</SectionTitle>
				</SectionHeader>
			</div>
			<PortfolioChart exchangeTokenBalances={exchangeTokenBalances} />
		</div>
	);
};

export default Portfolio;
