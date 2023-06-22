import { FC } from 'react'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { StatsContext } from 'contexts/StatsContext'
import useStatsData from 'hooks/useStatsData'

import { OpenInterest } from './charts/OpenInterest'
import { Traders } from './charts/Traders'
import { Trades } from './charts/Trades'
import { Volume } from './charts/Volume'
import { StatsContainer } from './stats.styles'

export const Stats: FC = () => {
	const statsData = useStatsData()

	return (
		<StatsContext.Provider value={statsData}>
			<DesktopOnlyView>
				<StatsContainer>
					<Volume />
					<Trades />
					<Traders />
					<OpenInterest mobile={false} />
				</StatsContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StatsContainer>
					<Volume />
					<Trades />
					<Traders />
					<OpenInterest mobile />
				</StatsContainer>
			</MobileOrTabletView>
		</StatsContext.Provider>
	)
}
