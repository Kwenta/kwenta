import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPosition from 'queries/futures/useGetFuturesPosition';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';

import { DesktopOnlyView } from 'components/Media';

import { isWalletConnectedState, isL2State } from 'store/wallet';
import WalletOverview from 'sections/futures/WalletOverview';
import Markets from 'sections/futures/Markets';
import Hero from 'sections/futures/Hero';

const Futures: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);

	const futuresMarketsQuery = useGetFuturesMarkets();
	const markets = futuresMarketsQuery?.data ?? null;
	const market = markets?.[0] ?? null;
	const futuresPositionQuery = useGetFuturesPosition(
		market?.asset ?? null,
		markets?.[0].market ?? null
	);
	console.log(futuresPositionQuery);

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					{/* {!isL2 ? (
						<h1>{t('futures.not-available-on-l1')}</h1>
					) : ( */}
					<FullHeightContainer>
						<MainContent>
							<Hero />
							<Markets />
						</MainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<WalletOverview />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
					{/* )} */}
				</PageContent>
			</AppLayout>
		</>
	);
};

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;

export default Futures;
