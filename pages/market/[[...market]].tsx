import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView } from 'components/Media';

import { PageContent, FullHeightContainer, MainContent, RightSideContent } from 'styles/common';
import { useTranslation } from 'react-i18next';

import MarketInfo from 'sections/futures/MarketInfo';
import Trade from 'sections/futures/Trade';

const Market: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<StyledMainContent>
							<MarketInfo market={router.query.market?.[0]!} />
						</StyledMainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

export default Market;

const StyledMainContent = styled(MainContent)`
	max-width: 1031px;
	margin-left: 0;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 385px;
	padding-left: 15px;
`;
