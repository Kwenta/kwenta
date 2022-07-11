import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PageContent, FullHeightContainer } from 'styles/common';
import DashboardContainer from 'sections/dashboard/DashboardContainer';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import MobileDashboard from 'sections/dashboard/MobileDashboard';

type AppLayoutProps = {
	children: React.ReactNode;
};

type DashboardComponent = FC & { layout: FC<AppLayoutProps> };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
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
		</>
	);
};

Dashboard.layout = AppLayout;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Dashboard;
