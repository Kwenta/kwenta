import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';
import { useEffect, FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/ErrorView';
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
import MarketHead from 'sections/futures/MarketInfo/MarketHead';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TradePanelHeader from 'sections/futures/Trade/TradePanelHeader';
import TransferIsolatedMarginModal from 'sections/futures/Trade/TransferIsolatedMarginModal';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { setMarketAsset } from 'state/futures/reducer';
import { selectFuturesType, selectMarketAsset } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { futuresAccountState, showCrossMarginOnboardState } from 'store/futures';
import { PageContent, FullHeightContainer, RightSideContent } from 'styles/common';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

type MarketComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Market: MarketComponent = () => {
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();
	const { t } = useTranslation();
	const futuresData = useFuturesData();
	const dispatch = useAppDispatch();

	const routerMarketAsset = router.query.asset as FuturesMarketAsset;

	const setCurrentMarket = useAppSelector(selectMarketAsset);
	const { openConnectModal } = useConnectModal();
	const openModal = useAppSelector(selectOpenModal);
	const account = useRecoilValue(futuresAccountState);
	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);

	useEffect(() => {
		if (routerMarketAsset && MarketKeyByAsset[routerMarketAsset]) {
			dispatch(setMarketAsset(routerMarketAsset));
		}
	}, [router, setCurrentMarket, dispatch, routerMarketAsset]);

	return (
		<FuturesContext.Provider value={futuresData}>
			<MarketHead />
			<CrossMarginOnboard onClose={() => setShowOnboard(false)} isOpen={showOnboard} />
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<LeftSidebar />
						<MarketInfo />
						<StyledRightSideContent>
							{!walletAddress ? (
								<DepositButton variant="yellow" onClick={openConnectModal}>
									<ButtonContent>{t('common.wallet.connect-wallet')}</ButtonContent>
								</DepositButton>
							) : (
								<TradePanelHeader
									onManageBalance={() => dispatch(setOpenModal('futures_isolated_transfer'))}
									accountType={'isolated_margin'}
								/>
							)}
							<TradePanelDesktop walletAddress={walletAddress} account={account} />
							{openModal === 'futures_isolated_transfer' && (
								<TransferIsolatedMarginModal
									defaultTab="deposit"
									onDismiss={() => dispatch(setOpenModal(null))}
								/>
							)}
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

const TradePanelDesktop: FC<TradePanelProps> = memo(({ walletAddress, account }) => {
	const { t } = useTranslation();
	const { handleRefetch } = useRefetchContext();
	const router = useRouter();
	const isL2 = useIsL2();
	const accountType = useAppSelector(selectFuturesType);

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
});

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

const DepositButton = styled(Button)`
	height: 55px;
	width: 100%;
	margin-bottom: 16px;
`;

const ButtonContent = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 10px;
`;
