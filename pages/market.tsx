import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Error from 'components/Error';
import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import { FuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import useFuturesData from 'hooks/useFuturesData';
import useIsL2 from 'hooks/useIsL2';
import { FuturesAccountState } from 'queries/futures/types';
import CrossMarginOnboard from 'sections/futures/CrossMarginOnboard';
import LeftSidebar from 'sections/futures/LeftSidebar/LeftSidebar';
import MarketInfo from 'sections/futures/MarketInfo';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { setMarketAsset } from 'state/futures/reducer';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import {
	futuresAccountState,
	futuresAccountTypeState,
	showCrossMarginOnboardState,
} from 'store/futures';
import { PageContent, FullHeightContainer, RightSideContent } from 'styles/common';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();
	const futuresData = useFuturesData();
	const dispatch = useAppDispatch();

	const routerMarketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useAppSelector(selectMarketAsset);
	const account = useRecoilValue(futuresAccountState);
	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);

	useEffect(() => {
		if (routerMarketAsset && MarketKeyByAsset[routerMarketAsset]) {
			dispatch(setMarketAsset(routerMarketAsset));
		}
	}, [router, setCurrentMarket, dispatch, routerMarketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<CrossMarginOnboard onClose={() => setShowOnboard(false)} isOpen={showOnboard} />
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<LeftSidebar />
						<MarketInfo />
						<StyledRightSideContent>
							<TradePanelDesktop walletAddress={walletAddress} account={account} />
						</StyledRightSideContent>
					</StyledFullHeightContainer>
					<GitHashID />
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{walletAddress && account.status === 'initial-fetch' ? <Loader /> : <MobileTrade />}
				<GitHashID />
			</MobileOrTabletView>
		</FuturesContext.Provider>
	);
};

type TradePanelProps = {
	walletAddress: string | null;
	account: FuturesAccountState;
};

function TradePanelDesktop({ walletAddress, account }: TradePanelProps) {
	const { t } = useTranslation();
	const { handleRefetch } = useRefetchContext();
	const router = useRouter();
	const isL2 = useIsL2();
	const accountType = useRecoilValue(futuresAccountTypeState);

	if (walletAddress && !isL2) {
		return <FuturesUnsupportedNetwork />;
	}

	if (
		!router.isReady ||
		(accountType === 'cross_margin' && walletAddress && account.status === 'initial-fetch')
	) {
		return <Loader />;
	}

	if (accountType === 'cross_margin') {
		return account.status === 'error' && !account.crossMarginAddress ? (
			<div>
				<Error
					message={t('futures.market.trade.cross-margin.account-query-failed')}
					retryButton={{
						onClick: () => handleRefetch('cross-margin-account-change', 5),
						label: 'Retry',
					}}
				/>
			</div>
		) : (
			<TradeCrossMargin />
		);
	}
	return <TradeIsolatedMargin />;
}

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
		grid-template-columns: 320px 1fr 370px;
		column-gap: 15px;
		width: 100%;
	}
	@media (max-width: 1200px) {
		grid-template-columns: 70% 30%;
		width: calc(100% - 15px);
	}
`;
