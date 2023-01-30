import { useRouter } from 'next/router';
import { useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Error from 'components/ErrorView';
import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import { FuturesContext } from 'contexts/FuturesContext';
import useFuturesData from 'hooks/useFuturesData';
import useIsL2 from 'hooks/useIsL2';
import CrossMarginOnboard from 'sections/futures/CrossMarginOnboard';
import LeftSidebar from 'sections/futures/LeftSidebar/LeftSidebar';
import MarketInfo from 'sections/futures/MarketInfo';
import MarketHead from 'sections/futures/MarketInfo/MarketHead';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { fetchCrossMarginAccount } from 'state/futures/actions';
import { setMarketAsset, setShowCrossMarginOnboard } from 'state/futures/reducer';
import {
	selectCMAccountQueryStatus,
	selectCrossMarginAccount,
	selectFuturesType,
	selectMarketAsset,
	selectShowCrossMarginOnboard,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { PageContent, FullHeightContainer, RightSideContent } from 'styles/common';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();
	const futuresData = useFuturesData();
	const dispatch = useAppDispatch();

	const routerMarketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useAppSelector(selectMarketAsset);
	const showOnboard = useAppSelector(selectShowCrossMarginOnboard);
	const queryStatus = useAppSelector(selectCMAccountQueryStatus);
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount);

	useEffect(() => {
		if (routerMarketAsset && MarketKeyByAsset[routerMarketAsset]) {
			dispatch(setMarketAsset(routerMarketAsset));
		}
	}, [router, setCurrentMarket, dispatch, routerMarketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<MarketHead />

			<CrossMarginOnboard
				onClose={() => dispatch(setShowCrossMarginOnboard(false))}
				isOpen={showOnboard}
			/>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<LeftSidebar />
						<MarketInfo />
						<StyledRightSideContent>
							<TradePanelDesktop />
						</StyledRightSideContent>
					</StyledFullHeightContainer>
					<GitHashID />
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{walletAddress && !crossMarginAccount && queryStatus.status === FetchStatus.Idle ? (
					<Loader />
				) : (
					<MobileTrade />
				)}
				<GitHashID />
			</MobileOrTabletView>
		</FuturesContext.Provider>
	);
};

function TradePanelDesktop() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const isL2 = useIsL2();
	const { walletAddress } = Connector.useContainer();
	const accountType = useAppSelector(selectFuturesType);
	const queryStatus = useAppSelector(selectCMAccountQueryStatus);
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount);

	if (walletAddress && !isL2) {
		return <FuturesUnsupportedNetwork />;
	}

	if (
		!router.isReady ||
		(accountType === 'cross_margin' &&
			walletAddress &&
			!crossMarginAccount &&
			queryStatus.status === FetchStatus.Idle)
	) {
		return <Loader />;
	}

	if (accountType === 'cross_margin') {
		return queryStatus.status === FetchStatus.Error && !crossMarginAccount ? (
			<div>
				<Error
					message={t('futures.market.trade.cross-margin.account-query-failed')}
					retryButton={{
						onClick: () => dispatch(fetchCrossMarginAccount()),
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
