import { FC, useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView } from 'components/Media';

import { PageContent, FullHeightContainer, MainContent, RightSideContent } from 'styles/common';
import { useTranslation } from 'react-i18next';

import MarketInfo from 'sections/futures/MarketInfo';
import Trade from 'sections/futures/Trade';
import { PotentialTrade } from 'sections/futures/types';

const Market: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const [potentialTrade, setPotentialTrade] = useState<PotentialTrade | null>(null);

	return (
		<>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<FullHeightContainer>
						<StyledMainContent>
							<MarketInfo market={router.query.market?.[0]!} potentialTrade={potentialTrade} />
						</StyledMainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade onEditPositionInput={setPotentialTrade} />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

export default Market;

const StyledPageContent = styled(PageContent)`
	max-width: 1440px;
`;

const StyledMainContent = styled(MainContent)`
	max-width: initial;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 349px;
	padding-left: 15px;
`;
