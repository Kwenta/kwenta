import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView } from 'components/Media';

import {
	PageContent,
	FullHeightContainer,
	MainContent,
	RightSideContent,
	LeftSideContent,
} from 'styles/common';
import { useTranslation } from 'react-i18next';

import MarketInfo from 'sections/futures/MarketInfo';
import Trade from 'sections/futures/Trade';
import TradingHistory from 'sections/futures/TradingHistory';

const Market = () => {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<StyledFullHeightContainer>
						<DesktopOnlyView>
							<StyledLeftSideContent>
								<TradingHistory currencyKey={router.query.market?.[0]!} />
							</StyledLeftSideContent>
						</DesktopOnlyView>
						<StyledMainContent>
							<MarketInfo market={router.query.market?.[0]!} />
						</StyledMainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</StyledFullHeightContainer>
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

export default Market;

const StyledPageContent = styled(PageContent)``;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	display: grid;
	grid-template-columns: 20% 60% 20%;
	column-gap: 15px;
	width: calc(100% - 30px);
`;

const StyledMainContent = styled(MainContent)`
	max-width: unset;
	margin: unset;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 100%;
`;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 100%;
`;
