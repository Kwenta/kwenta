import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageContent, MainContent, FullHeightContainer } from 'styles/common';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';

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
				<FullHeightContainer>
					<MobileHiddenView>
						<MainContent>
							<Leaderboard />
						</MainContent>
					</MobileHiddenView>
					<MobileOnlyView>
						<MobileMainContent>
							<Leaderboard />
						</MobileMainContent>
					</MobileOnlyView>
				</FullHeightContainer>
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
