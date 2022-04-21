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
					<FullHeightContainer>
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
					</FullHeightContainer>
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

export default Market;

const StyledPageContent = styled(PageContent)``;

const StyledMainContent = styled(MainContent)`
	max-width: initial;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 349px;
	padding-left: 15px;
`;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 349px;
	padding-right: 15px;
`;
