import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import get from 'lodash/get';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import AppLayout from 'sections/shared/Layout/AppLayout';
import Hero from 'sections/futures/Hero';
import Markets from 'sections/futures/Markets';
import Splash from 'sections/futures/Onboarding/Splash';
import Tweet from 'sections/futures/Onboarding/Tweet';
import WalletOverview from 'sections/futures/WalletOverview';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAllMarkets from 'queries/futures/useGetFuturesPositionForAllMarkets';
import useSynthetixQueries from '@synthetixio/queries';
import { FuturesMarket } from 'queries/futures/types';
import { isL2KovanState, isWalletConnectedState, walletAddressState } from 'store/wallet';

import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';
import { DesktopOnlyView } from 'components/Media';

import { zeroBN } from 'utils/formatters/number';

import Loading from 'components/Loading';

const Futures: FC = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(true);

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
	const sUSDBalance = synthsWalletBalancesQuery.isSuccess
		? get(synthsWalletBalancesQuery.data, ['balancesMap', 'sUSD', 'balance'], zeroBN)
		: null;

	useEffect(() => {
		setTimeout(() => setLoading(false), 1500);
	}, []);

	if (loading) return <Loading />;

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			{!isWalletConnected || !isL2Kovan ? (
				<Splash />
			) : !sUSDBalance?.toNumber() ? (
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
