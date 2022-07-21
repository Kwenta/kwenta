import { RefetchProvider } from 'contexts/RefetchContext';
import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import DashboardContainer from 'sections/dashboard/DashboardContainer';
import MobileDashboard from 'sections/dashboard/MobileDashboard';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, FullHeightContainer } from 'styles/common';

type AppLayoutProps = {
	children: React.ReactNode;
};

type DashboardComponent = FC & { layout: FC<AppLayoutProps> };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();

	return (
		<RefetchProvider>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<MobileHiddenView>
				<PageContent>
					<StyledFullHeightContainer>
						<DashboardContainer />
					</StyledFullHeightContainer>
				</PageContent>
			</MobileHiddenView>
			<MobileOnlyView>
				<MobileDashboard />
			</MobileOnlyView>
		</RefetchProvider>
	);
};

Dashboard.layout = AppLayout;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Dashboard;
