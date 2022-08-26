import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { FuturesContext } from 'contexts/FuturesContext';
import useFuturesData from 'hooks/useFuturesData';
import LeftSidebar from 'sections/futures/LeftSidebar/LeftSidebar';
import MarketInfo from 'sections/futures/MarketInfo';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import Trade from 'sections/futures/Trade';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { currentMarketState } from 'store/futures';
import {
	PageContent,
	FullHeightContainer,
	MainContent,
	RightSideContent,
	LeftSideContent,
} from 'styles/common';
import { FuturesMarketAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const marketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useSetRecoilState(currentMarketState);

	const futuresData = useFuturesData();

	useEffect(() => {
		if (marketAsset) setCurrentMarket(marketAsset);
	}, [router, setCurrentMarket, marketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.marketAsset })}</title>
			</Head>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<StyledLeftSideContent>
							<LeftSidebar />
						</StyledLeftSideContent>
						<StyledMainContent>
							<MarketInfo />
						</StyledMainContent>
						<StyledRightSideContent>
							<Trade />
						</StyledRightSideContent>
					</StyledFullHeightContainer>
					<GitHashID />
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileTrade />
				<GitHashID />
			</MobileOrTabletView>
		</FuturesContext.Provider>
	);
};

Market.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Market;

const StyledMainContent = styled(MainContent)`
	margin-bottom: 0px;
	max-width: unset;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 100%;
`;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 100%;
`;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	display: grid;
	grid-template-columns: 20% 60% 20%;
	column-gap: 15px;
	width: calc(100% - 30px);
	@media (min-width: 1725px) {
		display: grid;
		grid-template-columns: 400px 1fr 400px;
		column-gap: 15px;
		width: 100%;
	}
	@media (max-width: 1200px) {
		${StyledLeftSideContent} {
			display: none;
		}
		grid-template-columns: 70% 30%;
		width: calc(100% - 15px);
	}
`;
