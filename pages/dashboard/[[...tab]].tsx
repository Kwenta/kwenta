import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import AppLayout from 'sections/shared/Layout/AppLayout';
import {
	PageContent,
	MainContent,
	FullHeightContainer,
} from 'styles/common';
import DashboardContainer from 'sections/dashboard/DashboardContainer';

const Futures: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<DashboardContainer />
						</MainContent>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

export default Futures;
