import styled from 'styled-components';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import {
	BottomShadow,
	MainContent,
	RightSideContent,
	FullHeightContainer,
	PageContent,
	MobileContainerMixin,
} from 'styles/common';

import AppLayout from 'sections/shared/Layout/AppLayout';
import DashboardCard from 'sections/dashboard/DashboardCard';
import TrendingSynths from 'sections/dashboard/TrendingSynths';
import Onboard from 'sections/dashboard/Onboard';

import { isWalletConnectedState } from 'store/wallet';

const DashboardPage = () => {
	const { t } = useTranslation();

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const activeView = isWalletConnected ? <DashboardCard /> : <Onboard />;

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<DesktopOnlyView>
						<FullHeightContainer>
							<MainContent>{activeView}</MainContent>
							<RightSideContent>
								<TrendingSynths />
							</RightSideContent>
							<BottomShadow />
						</FullHeightContainer>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>{activeView}</MobileContainer>
					</MobileOrTabletView>
				</PageContent>
			</AppLayout>
		</>
	);
};

const MobileContainer = styled.div`
	${MobileContainerMixin};
	padding-top: 90px;
`;

export default DashboardPage;
