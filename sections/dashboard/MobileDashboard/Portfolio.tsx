import Wei from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SectionHeader, SectionTitle } from 'components/mobile/futures';

import PortfolioChart from '../PortfolioChart';

type PortfolioProps = {
	exchangeTokenBalances: Wei;
};

const Portfolio: React.FC<PortfolioProps> = ({ exchangeTokenBalances }) => {
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
