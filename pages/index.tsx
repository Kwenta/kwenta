import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import get from 'lodash/get';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

// import AppLayout from 'sections/shared/Layout/AppLayout';
// import Hero from 'sections/futures/Hero';
// import Markets from 'sections/futures/Markets';
import Splash from 'sections/futures/Onboarding/Splash';
import Tweet from 'sections/futures/Onboarding/Tweet';
// import WalletOverview from 'sections/futures/WalletOverview';
import useSynthetixQueries from '@synthetixio/queries';
import { isL2KovanState, isWalletConnectedState, walletAddressState } from 'store/wallet';

// import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';
// import { DesktopOnlyView } from 'components/Media';

import { zeroBN } from 'utils/formatters/number';

import Loading from 'components/Loading';

import AppLayout from 'sections/shared/Layout/AppLayout';
import {
	PageContent,
	MainContent,
	RightSideContent,
	FullHeightContainer,
	FlexDivRow,
} from 'styles/common';
import { DesktopOnlyView } from 'components/Media';
import Markets from 'sections/futures/Markets';
import Hero from 'sections/futures/Hero';
import FuturesDashboardTabs from './futures-dashboard-tabs';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import { Subheader } from 'sections/futures/common';

type CurrentPageState = 'splash' | 'tweet' | 'futures' | null;

const Futures: FC = () => {
	const { t } = useTranslation();
	const [isLoading, setLoading] = useState<boolean>(true);
	const [currentPage, setCurrentPage] = useState<CurrentPageState>(null);

	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2Kovan = useRecoilValue(isL2KovanState);

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress, {
		refetchInterval: 5000,
	});

	const sUSDBalance = synthsWalletBalancesQuery.isSuccess
		? get(synthsWalletBalancesQuery.data, ['balancesMap', 'sUSD', 'balance'], zeroBN)
		: null;

	useEffect(() => {
		(async () => {
			// if network isnt l2 kovan, direct to splash screen
			if (!isWalletConnected || !isL2Kovan) {
				setCurrentPage('splash');
				return;
			}

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
		sUSDBalance,
	]);

	useEffect(() => {
		setTimeout(() => setLoading(false), 1500);
	}, []);

	if (isLoading) return <Loading />;

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
								<Hero displayReferBox={false} />
								<FuturesDashboardTabs />
							</MainContent>
							<DesktopOnlyView>
								<StyledRightSideContent>
									<HeaderRow>
										<Subheader>{t('futures.leaderboard.title')}</Subheader>
									</HeaderRow>
									<Leaderboard compact />
									<Markets />
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

const HeaderRow = styled(FlexDivRow)`
	justify-content: space-between;
`;

export default Futures;
