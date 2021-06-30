import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView } from 'components/Media';

import { PageContent, FullHeightContainer, MainContent, RightSideContent } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, isL2State } from 'store/wallet';

import MarketInfo from 'sections/futures/MarketInfo';
import Trade from 'sections/futures/Trade';

type MarketProps = {};

const Market: React.FC<MarketProps> = ({}) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const router = useRouter();

	return (
		<>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<AppLayout>
				<PageContent>
					{/* {!isL2 ? (
						<h1>{t('futures.not-available-on-l1')}</h1>
					) : ( */}
					<FullHeightContainer>
						<MainContent>
							<MarketInfo />
						</MainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
					{/* )} */}
				</PageContent>
			</AppLayout>
		</>
	);
};
export default Market;

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;
