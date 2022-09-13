import React from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { ExchangeContext } from 'contexts/ExchangeContext';
import useExchange from 'hooks/useExchange';
import BasicSwap from 'sections/exchange/BasicSwap';
import ExchangeHead from 'sections/exchange/ExchangeHead';
import ExchangeModals from 'sections/exchange/ExchangeModals';
import { MobileSwap } from 'sections/exchange/MobileSwap';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer, MainContent } from 'styles/common';

type ExchangeComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

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

const Exchange: ExchangeComponent = () => {
	const exchangeData = useExchange({
		routingEnabled: true,
		showNoSynthsCard: false,
	});

	return (
		<ExchangeContext.Provider value={exchangeData}>
			<ExchangeHead />
			<ExchangeContent />
		</ExchangeContext.Provider>
	);
};

Exchange.getLayout = (page) => <AppLayout>{page}</AppLayout>;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Exchange;
