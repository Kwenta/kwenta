import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { PageContent, MainContent, FullHeightContainer } from 'styles/common';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import AppLayout from 'sections/shared/Layout/AppLayout';

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
					<MainContent>
						<Leaderboard />
					</MainContent>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

Leader.layout = AppLayout;

export default Leader;
