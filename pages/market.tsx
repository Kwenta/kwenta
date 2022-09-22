import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import { FuturesContext } from 'contexts/FuturesContext';
import useFuturesData from 'hooks/useFuturesData';
import useIsL1 from 'hooks/useIsL1';
import LeftSidebar from 'sections/futures/LeftSidebar/LeftSidebar';
import MarketInfo from 'sections/futures/MarketInfo';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import FuturesUnsupported from 'sections/futures/Trade/FuturesUnsupported';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { currentMarketState, futuresAccountState, futuresAccountTypeState } from 'store/futures';
import { PageContent, FullHeightContainer, RightSideContent } from 'styles/common';
import { FuturesMarketAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { walletAddress, isWalletConnected, unsupportedNetwork } = Connector.useContainer();
	const isL1 = useIsL1();

	const marketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useSetRecoilState(currentMarketState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { ready } = useRecoilValue(futuresAccountState);

	const futuresData = useFuturesData();

	useEffect(() => {
		if (marketAsset) setCurrentMarket(marketAsset);
	}, [router, setCurrentMarket, marketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<LeftSidebar />
						<MarketInfo />
						<StyledRightSideContent>
							{!isWalletConnected || unsupportedNetwork || isL1 ? (
								<FuturesUnsupported isWalletConnected={isWalletConnected} />
							) : walletAddress && !ready ? (
								<Loader />
							) : selectedAccountType === 'cross_margin' ? (
								<TradeCrossMargin />
							) : (
								<TradeIsolatedMargin />
							)}
						</StyledRightSideContent>
					</StyledFullHeightContainer>
					<GitHashID />
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{walletAddress && !ready ? <Loader /> : <MobileTrade />}
				<GitHashID />
			</MobileOrTabletView>
		</FuturesContext.Provider>
	);
};

Market.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Market;

const StyledRightSideContent = styled(RightSideContent)`
	width: 100%;
`;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	display: grid;
	grid-template-columns: 20% 55% 25%;
	column-gap: 15px;
	width: calc(100% - 30px);
	@media (min-width: 1725px) {
		display: grid;
		grid-template-columns: 400px 1fr 400px;
		column-gap: 15px;
		width: 100%;
	}
	@media (max-width: 1200px) {
		grid-template-columns: 70% 30%;
		width: calc(100% - 15px);
	}
`;
