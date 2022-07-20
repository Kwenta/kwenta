import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, MainContent, FullHeightContainer } from 'styles/common';

type AppLayoutProps = {
	children: React.ReactNode;
};

type LeaderComponent = FC & { layout: FC<AppLayoutProps> };

const Leader: LeaderComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<PageContent>
				<MobileHiddenView>
					<FullHeightContainer>
						<MainContent>
							<Leaderboard />
						</MainContent>
					</FullHeightContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<MobileMainContent>
						<Leaderboard />
					</MobileMainContent>
				</MobileOnlyView>
			</PageContent>
		</>
	);
};

const MobileMainContent = styled.div`
	width: 100vw;
	padding: 15px;
`;

Leader.layout = AppLayout;

export default Leader;
