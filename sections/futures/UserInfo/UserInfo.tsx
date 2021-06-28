import React, { useMemo } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { TabList, TabPanel, TabButton } from 'components/Tab';

import PositionCard from '../PositionCard';

import ROUTES from 'constants/routes';
import { CurrencyKey } from 'constants/currency';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	TRADES = 'trades',
}

const FutureTabs = Object.values(FuturesTab);

type UserInfoProps = {
	baseCurrencyKey: CurrencyKey;
};

const UserInfo: React.FC<UserInfoProps> = ({ baseCurrencyKey }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as FuturesTab;
			if (FutureTabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router.query]);

	const activeTab = tabQuery != null ? tabQuery : FuturesTab.POSITION;

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: t('futures.market.user.position.tab'),
				active: activeTab === FuturesTab.POSITION,
				onClick: () => router.push(ROUTES.Futures.Market.Position(baseCurrencyKey)),
			},
			{
				name: FuturesTab.ORDERS,
				label: t('futures.market.user.orders.tab'),
				active: activeTab === FuturesTab.ORDERS,
				onClick: () => router.push(ROUTES.Futures.Market.Orders(baseCurrencyKey)),
			},
			{
				name: FuturesTab.TRADES,
				label: t('futures.market.user.trades.tab'),
				active: activeTab === FuturesTab.TRADES,
				onClick: () => router.push(ROUTES.Futures.Market.Trades(baseCurrencyKey)),
			},
		],
		[t, activeTab, router]
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
				<PositionCard currencyKey={baseCurrencyKey} />
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab}></TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab}></TabPanel>
		</>
	);
};
export default UserInfo;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;
