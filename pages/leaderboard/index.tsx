import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, MainContent, FullHeightContainer } from 'styles/common';

type LeaderComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Leader: LeaderComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('leaderboard.page-title')}</title>
			</Head>
			<PageContent>
				<MobileHiddenView>
					<FullHeightContainer>
						<MainContent>
							<Leaderboard />
							<GitHashID />
						</MainContent>
					</FullHeightContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<MobileMainContent>
						<Leaderboard mobile />
						<GitHashID />
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

Leader.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Leader;
