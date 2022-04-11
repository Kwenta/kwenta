import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, FullHeightContainer } from 'styles/common';
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
					<StyledFullHeightContainer>
						<DashboardContainer />
					</StyledFullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Futures;
