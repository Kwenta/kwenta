import { useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

import { DesktopOnlyView, MobileHiddenView, MobileOnlyView } from 'components/Media';

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
import { CurrencyKey } from 'constants/currency';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import { currentMarketState } from 'store/futures';
import { RefetchProvider } from 'contexts/RefetchContext';

const Market = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const marketAsset = router.query.market?.[0] as CurrencyKey;

	const [, setCurrentMarket] = useRecoilState(currentMarketState);

	useEffect(() => {
		if (marketAsset) setCurrentMarket(marketAsset);
	}, [setCurrentMarket, marketAsset]);

	return (
		<RefetchProvider>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<MobileHiddenView>
				<PageContent>
					<StyledFullHeightContainer>
						<DesktopOnlyView>
							<StyledLeftSideContent>
								<TradingHistory />
							</StyledLeftSideContent>
						</DesktopOnlyView>
						<StyledMainContent>
							<MarketInfo />
						</StyledMainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</StyledFullHeightContainer>
				</PageContent>
			</MobileHiddenView>
			<MobileOnlyView>
				<MobileTrade />
			</MobileOnlyView>
		</RefetchProvider>
	);
};

export default Market;

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
