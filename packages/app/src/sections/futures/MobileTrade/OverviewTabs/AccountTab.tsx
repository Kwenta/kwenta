import React from 'react'
import { selectFuturesType } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

import MarketInfoBox from 'sections/futures/MarketInfoBox'
import { Pane, SectionHeader, SectionTitle } from 'sections/futures/mobile'
import MarketActions from 'sections/futures/Trade/MarketActions'
import MarginInfoBox from 'sections/futures/TradeCrossMargin/CrossMarginInfoBox'

const AccountTab: React.FC = () => {
	const accountType = useAppSelector(selectFuturesType)
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Account</SectionTitle>
			</SectionHeader>

			{accountType === 'isolated_margin' ? (
				<>
					<MarketInfoBox />
					<MarketActions />
				</>
			) : (
				<MarginInfoBox />
			)}
		</Pane>
	)
}

export default AccountTab
