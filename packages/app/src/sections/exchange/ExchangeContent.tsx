import { memo } from 'react'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import BasicSwap from 'sections/exchange/BasicSwap'
import ExchangeModals from 'sections/exchange/ExchangeModals'
import { MobileSwap } from 'sections/exchange/MobileSwap'
import { PageContent } from 'styles/common'

const ExchangeContent = memo(() => (
	<PageContent>
		<DesktopOnlyView>
			<BasicSwap />
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileSwap />
		</MobileOrTabletView>
		<ExchangeModals />
	</PageContent>
))

export default ExchangeContent
