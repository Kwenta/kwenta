import React, { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';
import { DesktopOnlyView } from 'components/Media';
import Markets from 'sections/futures/Markets';
import Hero from 'sections/futures/Hero';
import FuturesDashboardTabs from './futures-dashboard-tabs';

const Futures: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures-dashboard.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<Hero displayReferBox={false} />
							<FuturesDashboardTabs />
						</MainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Markets />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;

export default Futures;
