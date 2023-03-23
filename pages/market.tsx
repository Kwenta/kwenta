import { useRouter } from 'next/router';
import { useEffect, FC, useCallback } from 'react';
import styled from 'styled-components';

import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { FuturesMarketAsset } from 'sdk/types/futures';
import CrossMarginOnboard from 'sections/futures/CrossMarginOnboard';
import MarketDetails from 'sections/futures/MarketDetails';
import MarketInfo from 'sections/futures/MarketInfo';
import MarketHead from 'sections/futures/MarketInfo/MarketHead';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TransferIsolatedMarginModal from 'sections/futures/Trade/TransferIsolatedMarginModal';
import DepositWithdrawCrossMargin from 'sections/futures/TradeCrossMargin/DepositWithdrawCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { clearTradeInputs } from 'state/futures/actions';
import { usePollMarketFuturesData } from 'state/futures/hooks';
import {
	setFuturesAccountType,
	setMarketAsset,
	setShowCrossMarginOnboard,
} from 'state/futures/reducer';
import {
	selectCMAccountQueryStatus,
	selectCrossMarginAccount,
	selectFuturesType,
	selectMarketAsset,
	selectShowCrossMarginOnboard,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { PageContent } from 'styles/common';
import { MarketKeyByAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();
	usePollMarketFuturesData();

	const routerMarketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useAppSelector(selectMarketAsset);
	const showOnboard = useAppSelector(selectShowCrossMarginOnboard);
	const openModal = useAppSelector(selectOpenModal);
	const accountType = useAppSelector(selectFuturesType);

	const resetTradeState = useCallback(() => {
		dispatch(clearTradeInputs());
	}, [dispatch]);

	useEffect(() => {
		const handleRouteChange = () => {
			resetTradeState();
		};
		router.events.on('routeChangeStart', handleRouteChange);
		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, resetTradeState]);

	const routerAccountType =
		router.query.accountType === 'cross_margin' ? 'cross_margin' : 'isolated_margin';

	useEffect(() => {
		if (router.isReady && accountType !== routerAccountType) {
			dispatch(setFuturesAccountType(routerAccountType));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, routerAccountType]);

	useEffect(() => {
		resetTradeState();
		// Clear trade state when switching address
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress]);

	useEffect(() => {
		if (routerMarketAsset && MarketKeyByAsset[routerMarketAsset]) {
			dispatch(setMarketAsset(routerMarketAsset));
		}
	}, [router, setCurrentMarket, dispatch, routerMarketAsset]);

	return (
		<>
			<MarketHead />

			<CrossMarginOnboard
				onClose={() => dispatch(setShowCrossMarginOnboard(false))}
				isOpen={showOnboard}
			/>
			<DesktopOnlyView>
				<PageContent>
					<MarketDetails />
					<StyledFullHeightContainer>
						<TradePanelDesktop />
						<MarketInfo />
					</StyledFullHeightContainer>
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileTrade />
			</MobileOrTabletView>
			{openModal === 'futures_isolated_transfer' && (
				<TransferIsolatedMarginModal
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}
			{(openModal === 'futures_cross_deposit' || openModal === 'futures_cross_withdraw') && (
				<DepositWithdrawCrossMargin
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}
		</>
	);
};

function TradePanelDesktop() {
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

	return <TradeIsolatedMargin />;
}

Market.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Market;

const StyledFullHeightContainer = styled.div`
	display: grid;
	grid-template-columns: 380px 1fr;
	grid-gap: 0;
	flex: 1;
	height: calc(100% - 56px);
`;
