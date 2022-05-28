import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

import { DesktopOnlyView, MobileHiddenView, MobileOnlyView } from 'components/Media';

import {
	PageContent,
	FullHeightContainer,
	MainContent,
	RightSideContent,
	LeftSideContent,
} from 'styles/common';
import { useTranslation } from 'react-i18next';

import MarketInfo from 'sections/futures/MarketInfo';
import Trade from 'sections/futures/Trade';
import TradingHistory from 'sections/futures/TradingHistory';
import { CurrencyKey } from 'constants/currency';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import { getMarketKey } from 'utils/futures';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import Connector from 'containers/Connector';
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade';
import { positionState } from 'store/futures';

const Market = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [, setPosition] = useRecoilState(positionState);

	const marketAsset = (router.query.market?.[0] as CurrencyKey) ?? null;
	const { network } = Connector.useContainer();

	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);

	useEffect(() => {
		if (futuresMarketPositionQuery.data) {
			setPosition(futuresMarketPositionQuery.data);
		}
	}, [futuresMarketPositionQuery.data, setPosition]);

	const futuresMarketPosition = futuresMarketPositionQuery?.data ?? null;

	const openOrdersQuery = useGetFuturesOpenOrders(marketAsset);
	const openOrders = openOrdersQuery?.data ?? [];

	const refetch = useCallback(() => {
		futuresMarketPositionQuery.refetch();
		openOrdersQuery.refetch();
	}, [futuresMarketPositionQuery, openOrdersQuery]);

	return (
		<>
			<Head>
				<title>{t('futures.market.page-title', { pair: router.query.market })}</title>
			</Head>
			<MobileHiddenView>
				<PageContent>
					<StyledFullHeightContainer>
						<DesktopOnlyView>
							<StyledLeftSideContent>
								<TradingHistory currencyKey={marketAsset} />
							</StyledLeftSideContent>
						</DesktopOnlyView>
						<StyledMainContent>
							<MarketInfo
								market={marketAsset}
								position={futuresMarketPosition}
								openOrders={openOrders}
								refetch={refetch}
							/>
						</StyledMainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<Trade refetch={refetch} currencyKey={marketAsset} />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</StyledFullHeightContainer>
				</PageContent>
			</MobileHiddenView>
			<MobileOnlyView>
				<MobileTrade position={futuresMarketPosition} />
			</MobileOnlyView>
		</>
	);
};

export default Market;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	display: grid;
	grid-template-columns: 20% 60% 20%;
	column-gap: 15px;
	width: calc(100% - 30px);
`;

const StyledMainContent = styled(MainContent)`
	max-width: unset;
	margin: unset;
`;

const StyledRightSideContent = styled(RightSideContent)`
	width: 100%;
`;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 100%;
`;
