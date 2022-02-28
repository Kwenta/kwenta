import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import AppLayout from 'sections/shared/Layout/AppLayout';
import {
	PageContent,
	MainContent,
	RightSideContent,
	FullHeightContainer,
	FlexDivRow,
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

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;

const HeaderRow = styled(FlexDivRow)`
	justify-content: space-between;
`;

export default Futures;
