import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAllMarkets from 'queries/futures/useGetFuturesPositionForAllMarkets';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent, MainContent, RightSideContent, FullHeightContainer } from 'styles/common';

import { DesktopOnlyView } from 'components/Media';

import { isWalletConnectedState, isL2State } from 'store/wallet';
import WalletOverview from 'sections/futures/WalletOverview';
import Markets from 'sections/futures/Markets';
import Hero from 'sections/futures/Hero';
import { FuturesMarket } from 'queries/futures/types';

const Futures: FC = () => {
	const { t } = useTranslation();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const futuresMarketsPositionQuery = useGetFuturesPositionForAllMarkets(
		(futuresMarkets as [FuturesMarket]).map(({ asset }: { asset: string }) => asset)
	);
	const futuresMarketsPositions = futuresMarketsPositionQuery?.data ?? null;

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<Hero />
							<Markets markets={futuresMarkets} />
						</MainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<WalletOverview positions={futuresMarketsPositions} />
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

export default Futures;
