import styled from 'styled-components';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { FlexDiv, FlexDivCol, PageContent } from 'styles/common';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import DashboardCard from 'sections/dashboard/DashboardCard';
import TrendingSynths from 'sections/dashboard/TrendingSynths';

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<DesktopOnlyView>
						<Container>
							<LeftContainer>
								<DashboardCard />
							</LeftContainer>
							<RightContainer>
								<TrendingSynths />
							</RightContainer>
						</Container>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>
							<DashboardCard />
						</MobileContainer>
					</MobileOrTabletView>
				</PageContent>
			</AppLayout>
		</>
	);
};

const MobileContainer = styled.div`
	max-width: 364px;
`;

const Container = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
`;

const LeftContainer = styled(FlexDivCol)`
	flex-grow: 1;
	padding-bottom: 48px;
	margin: 0px 75px;
	padding-top: 55px;
	max-width: 1000px;
`;

const RightContainer = styled(FlexDivCol)`
	width: 356px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 55px 32px 48px 32px;
	margin-right: -20px;
`;

export default DashboardPage;
