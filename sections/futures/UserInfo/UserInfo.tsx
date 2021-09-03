import React, { useMemo } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';

import { TabList, TabPanel, TabButton } from 'components/Tab';

import PositionCard from '../PositionCard';
import Trades from '../Trades';

import ROUTES from 'constants/routes';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesPositionHistory';
import { CurrencyKey, Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	TRADES = 'trades',
}

const FutureTabs = Object.values(FuturesTab);

type UserInfoProps = {
	marketAsset: CurrencyKey;
};

const UserInfo: React.FC<UserInfoProps> = ({ marketAsset }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(marketAsset);
	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const positionHistory = futuresPositionHistoryQuery?.data ?? null;

	const tabQuery = useMemo(() => {
		if (router.query.market) {
			const tab = castArray(router.query.market)[1] as FuturesTab;
			if (FutureTabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router]);

	const activeTab = tabQuery != null ? tabQuery : FuturesTab.POSITION;

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: t('futures.market.user.position.tab'),
				active: activeTab === FuturesTab.POSITION,
				onClick: () => router.push(ROUTES.Futures.Market.Position(marketAsset)),
			},

			{
				name: FuturesTab.TRADES,
				label: t('futures.market.user.trades.tab'),
				active: activeTab === FuturesTab.TRADES,
				onClick: () => router.push(ROUTES.Futures.Market.Trades(marketAsset)),
			},
		],
		[t, activeTab, router, marketAsset]
	);

	return (
		<>
			<StyledTabList>
				{TABS.map(({ name, label, active, onClick }) => (
					<TabButton key={name} name={name} active={active} onClick={onClick}>
						{label}
					</TabButton>
				))}
			</StyledTabList>
			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab}>
				<PositionCard
					position={futuresMarketsPosition ?? null}
					currencyKey={marketAsset}
					currencyKeyRate={marketAssetRate}
					onPositionClose={() =>
						setTimeout(() => {
							futuresPositionHistoryQuery.refetch();
							futuresMarketPositionQuery.refetch();
						}, 5 * 1000)
					}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab}>
				<Trades
					history={positionHistory}
					currencyKeyRate={marketAssetRate}
					isLoading={futuresPositionHistoryQuery.isLoading}
					isLoaded={futuresPositionHistoryQuery.isFetched}
				/>
			</TabPanel>
		</>
	);
};
export default UserInfo;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;
