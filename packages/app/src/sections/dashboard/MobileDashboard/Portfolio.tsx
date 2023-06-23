import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionHeader, SectionTitle } from 'sections/futures/mobile'

import PortfolioChart from '../PortfolioChart'

const Portfolio: FC = () => {
	const { t } = useTranslation()

	return (
		<div>
			<div style={{ margin: 15 }}>
				<SectionHeader>
					<SectionTitle>{t('dashboard.overview.mobile.portfolio')}</SectionTitle>
				</SectionHeader>
			</div>
			<PortfolioChart />
		</div>
	)
}

export default Portfolio
