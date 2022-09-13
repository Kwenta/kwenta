import React from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import BasicSwap from 'sections/exchange/BasicSwap';
import ExchangeModals from 'sections/exchange/ExchangeModals';
import { MobileSwap } from 'sections/exchange/MobileSwap';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer, MainContent } from 'styles/common';

const ExchangeContent = React.memo(() => (
	<PageContent>
		<DesktopOnlyView>
			<StyledFullHeightContainer>
				<MainContent>
					<BasicSwap />
					<GitHashID />
				</MainContent>
			</StyledFullHeightContainer>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileSwap />
			<GitHashID />
		</MobileOrTabletView>
		<ExchangeModals />
	</PageContent>
));

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default ExchangeContent;
