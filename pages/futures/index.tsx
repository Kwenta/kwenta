import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAllMarkets from 'queries/futures/useGetFuturesPositionForAllMarkets';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';

import { DesktopOnlyView } from 'components/Media';

import Hero from 'sections/futures/Hero';
import Splash from 'sections/futures/Onboarding/Splash';
import Tweet from 'sections/futures/Onboarding/Tweet';
import Markets from 'sections/futures/Markets';
import WalletOverview from 'sections/futures/WalletOverview';
import { FuturesMarket } from 'queries/futures/types';

import { useRecoilValue } from 'recoil';

import { isL2KovanState, isWalletConnectedState, walletAddressState } from 'store/wallet';
import get from 'lodash/get';

import useSynthetixQueries from '@synthetixio/queries';
import { zeroBN } from 'utils/formatters/number';

type CurrentPageState = 'splash' | 'tweet' | 'futures' | null;

const Futures: FC = () => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState<CurrentPageState>(null);
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2Kovan = useRecoilValue(isL2KovanState);

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress, {
		refetchInterval: 5000,
	});

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	const futuresMarketsPositionQuery = useGetFuturesPositionForAllMarkets(
		(futuresMarkets as [FuturesMarket]).map(({ asset }: { asset: string }) => asset)
	);
	const futuresMarketsPositions = futuresMarketsPositionQuery?.data ?? null;

	useEffect(() => {
		(async () => {
			// if network isnt l2 kovan, direct to splash screen
			if (!isWalletConnected || !isL2Kovan) {
				setCurrentPage('splash');
				return;
			}
			const sUSDBalance = synthsWalletBalancesQuery.isSuccess
				? get(synthsWalletBalancesQuery.data, ['balancesMap', 'sUSD', 'balance'], zeroBN)
				: null;
			// 	if network is l2 kovan but no susd, send them to tweet screen
			if (!sUSDBalance?.toNumber()) {
				setCurrentPage('tweet');
				return;
			}
			// if network is l2 kovan and they have susd, send them to regular dashboard
			setCurrentPage('futures');
		})();
	}, [
		isL2Kovan,
		isWalletConnected,
		synthsWalletBalancesQuery.data,
		synthsWalletBalancesQuery.isSuccess,
	]);

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			{currentPage === 'splash' ? (
				<Splash />
			) : currentPage === 'tweet' ? (
				<Tweet />
			) : (
				<AppLayout>
					<PageContent>
						<FullHeightContainer>
							<MainContent>
								<Hero />
								<Markets />
							</MainContent>
							<DesktopOnlyView>
								<StyledRightSideContent>
									<WalletOverview positions={futuresMarketsPositions} />
								</StyledRightSideContent>
							</DesktopOnlyView>
						</FullHeightContainer>
					</PageContent>
				</AppLayout>
			)}
		</>
	);
};

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;

export default Futures;
