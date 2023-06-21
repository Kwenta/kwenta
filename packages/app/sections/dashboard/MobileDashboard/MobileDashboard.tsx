import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FC } from 'react'

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner'

import OpenPositions, { OpenPositionsProps } from './OpenPositions'
import Portfolio from './Portfolio'

type MobileDashboardProps = Pick<OpenPositionsProps, 'exchangeTokens'>

const MobileDashboard: FC<MobileDashboardProps> = ({ exchangeTokens }) => {
	const exchangeTokenBalances = exchangeTokens.reduce(
		(initial, { usdBalance }) => initial.add(usdBalance),
		ZERO_WEI
	)

	return (
		<div>
			<CompetitionBanner />
			<Portfolio />
			<OpenPositions
				exchangeTokens={exchangeTokens}
				exchangeTokenBalances={exchangeTokenBalances}
			/>
		</div>
	)
}

export default MobileDashboard
