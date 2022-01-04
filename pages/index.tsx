import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Loading from 'components/Loading';

import AppLayout from 'sections/shared/Layout/AppLayout';
import {
	PageContent,
	MainContent,
	RightSideContent,
	FullHeightContainer,
	FlexDivRow,
} from 'styles/common';
import { DesktopOnlyView } from 'components/Media';
import Markets from 'sections/futures/Markets';
import Hero from 'sections/futures/Hero';
import FuturesDashboardTabs from './futures-dashboard-tabs';
import Leaderboard from 'sections/leaderboard/Leaderboard';
import { Subheader } from 'sections/futures/common';

const Futures: FC = () => {
	const { t } = useTranslation();
	const [isLoading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		setTimeout(() => setLoading(false), 1500);
	}, []);

	if (isLoading) return <Loading />;

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
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
								<HeaderRow>
									<Subheader>{t('futures.leaderboard.title')}</Subheader>
								</HeaderRow>
								<Leaderboard compact />
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

const HeaderRow = styled(FlexDivRow)`
	justify-content: space-between;
`;

export default Futures;
