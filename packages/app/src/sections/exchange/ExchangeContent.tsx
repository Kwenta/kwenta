import { memo } from 'react'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import BasicSwap from 'sections/exchange/BasicSwap'
import ExchangeModals from 'sections/exchange/ExchangeModals'
import { MobileSwap } from 'sections/exchange/MobileSwap'
import { PageContent, FullHeightContainer, MainContent } from 'styles/common'

const ExchangeContent = memo(() => (
	<PageContent>
		<DesktopOnlyView>
			<StyledFullHeightContainer>
				<MainContent>
					<BasicSwap />
				</MainContent>
			</StyledFullHeightContainer>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileSwap />
		</MobileOrTabletView>
		<ExchangeModals />
	</PageContent>
))

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`

export default ExchangeContent
