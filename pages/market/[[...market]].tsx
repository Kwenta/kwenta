import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { FuturesContext } from 'contexts/FuturesContext';
import { RefetchProvider } from 'contexts/RefetchContext';
import useFuturesData from 'hooks/useFuturesData';
import useQueryCrossMarginAccount from 'queries/futures/useQueryCrossMarginAccount';
import MarketInfo from 'sections/futures/MarketInfo';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import Trade from 'sections/futures/Trade';
import AccountTypeToggle from 'sections/futures/Trade/AccountTypeToggle';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { currentMarketState, futuresAccountState } from 'store/futures';
import {
	PageContent,
	FullHeightContainer,
	MainContent,
	RightSideContent,
	LeftSideContent,
} from 'styles/common';
import { FuturesMarketAsset } from 'utils/futures';

import LeftSidebar from '../../sections/futures/LeftSidebar/LeftSidebar';

type AppLayoutProps = {
	children: React.ReactNode;
};

type MarketComponent = FC & { layout: FC<AppLayoutProps> };

const Market: MarketComponent = () => {
	const { t } = useTranslation();
	const router = useRouter();

	useQueryCrossMarginAccount();

	const marketAsset = router.query.market?.[0] as FuturesMarketAsset;

	const setCurrentMarket = useSetRecoilState(currentMarketState);
	const { selectedAccountType } = useRecoilValue(futuresAccountState);
	const futuresAccount = useRecoilValue(futuresAccountState);

	const futuresData = useFuturesData();

	useEffect(() => {
		if (marketAsset) setCurrentMarket(marketAsset);
	}, [setCurrentMarket, marketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<RefetchProvider>
				<Head>
					<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
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
								{
									//TODO: Remove dev check
									process?.env?.NODE_ENV === 'development' &&
										futuresAccount.crossMarginAvailable && <AccountTypeToggle />
								}
								{selectedAccountType === 'cross_margin' ? <TradeCrossMargin /> : <Trade />}
							</StyledRightSideContent>
						</StyledFullHeightContainer>
					</PageContent>
				</DesktopOnlyView>
				<MobileOrTabletView>
					<MobileTrade />
				</MobileOrTabletView>
			</RefetchProvider>
		</FuturesContext.Provider>
	);
};

Market.layout = AppLayout;

export default Market;

const StyledMainContent = styled(MainContent)`
	margin: unset;
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
