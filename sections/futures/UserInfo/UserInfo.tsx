import React, { useMemo } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';

import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';

import PositionCard from '../PositionCard';
import Trades from '../Trades';

import ROUTES from 'constants/routes';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { CurrencyKey, Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { getMarketKey } from 'utils/futures';
import Connector from 'containers/Connector';

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
	const router = useRouter();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const { network } = Connector.useContainer();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);
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
				label: 'Open Position',
				active: activeTab === FuturesTab.POSITION,
				onClick: () => router.push(ROUTES.Markets.Position(marketAsset)),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Order History',
				badge: positionHistory?.length,
				disabled: true,
				active: activeTab === FuturesTab.TRADES,
				onClick: () => router.push(ROUTES.Markets.Trades(marketAsset)),
			},
		],
		[activeTab, router, marketAsset, positionHistory]
	);

	return (
		<>
			<TabButtonsContainer>
				{TABS.map(({ name, label, badge, active, disabled, onClick }) => (
					<TabButton
						key={name}
						title={label}
						badge={badge}
						active={active}
						disabled={disabled}
						onClick={onClick}
					/>
				))}
			</TabButtonsContainer>
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
					isLoading={futuresPositionHistoryQuery.isLoading}
					isLoaded={futuresPositionHistoryQuery.isFetched}
				/>
			</TabPanel>
		</>
	);
};
export default UserInfo;

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;
