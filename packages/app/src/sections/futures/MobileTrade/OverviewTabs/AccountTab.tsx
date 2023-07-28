import { FuturesMarginType } from '@kwenta/sdk/types'
import React from 'react'

import MarketInfoBox from 'sections/futures/MarketInfoBox'
import { Pane, SectionHeader, SectionTitle } from 'sections/futures/mobile'
import MarketActions from 'sections/futures/Trade/MarketActions'
import MarginInfoBox from 'sections/futures/TradeSmartMargin/SmartMarginInfoBox'
import { selectFuturesType } from 'state/futures/common/selectors'
import { useAppSelector } from 'state/hooks'

const AccountTab: React.FC = () => {
	const accountType = useAppSelector(selectFuturesType)
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Account</SectionTitle>
			</SectionHeader>

			{accountType === FuturesMarginType.CROSS_MARGIN ? (
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
