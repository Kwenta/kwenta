import { FC, useCallback, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import ShortingCard from 'sections/shorting/ShortingCard';
import ShortingHistory from 'sections/shorting/ShortingHistory';
import ShortingRewards from 'sections/shorting/ShortingRewards';
import ShortingStats from 'sections/shorting/ShortingStats';

import AppLayout from 'sections/shared/Layout/AppLayout';
import GitIDFooter from 'sections/shared/Layout/AppLayout/Footer';

import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';

import { DesktopOnlyView } from 'components/Media';

import { isWalletConnectedState, isL2State } from 'store/wallet';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';

const Shorting: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const router = useRouter();

	const redirectToHome = useCallback(() => router.push(ROUTES.Dashboard.Home), [router]);

	useEffect(() => {
		if (isL2) {
			redirectToHome();
		}
	}, [isL2, redirectToHome]);

	return (
		<>
			<Head>
				<title>{t('shorting.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					{!isL2 && (
						<FullHeightContainer>
							<MainContent>
								<ShortingCard />
								{isWalletConnected && <ShortingHistory />}
								<GitIDFooter />
							</MainContent>
							<DesktopOnlyView>
								<StyledRightSideContent>
									<ShortingRewards />
									<ShortingStats />
								</StyledRightSideContent>
							</DesktopOnlyView>
						</FullHeightContainer>
					)}
				</PageContent>
			</AppLayout>
		</>
	);
};

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
	> * + * {
		margin-top: 50px;
	}
`;

export default Shorting;
