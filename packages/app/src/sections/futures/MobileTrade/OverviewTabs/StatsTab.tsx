import React from 'react'

import MarketDetails from 'sections/futures/MarketDetails'
import { Pane, SectionHeader, SectionTitle } from 'sections/futures/mobile'

const StatsTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Market Stats</SectionTitle>
			</SectionHeader>
			<MarketDetails mobile />
		</Pane>
	)
}

export default StatsTab
