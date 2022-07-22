import { Synths } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { futuresMarketsState } from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';

import FuturesMarketsTable from '../FuturesMarketsTable';
import FuturesPositionsTable from '../FuturesPositionsTable';
import PortfolioChart from '../PortfolioChart';
import SpotMarketsTable from '../SpotMarketsTable';
import SynthBalancesTable from '../SynthBalancesTable';

enum PositionsTab {
	FUTURES = 'futures',
	SHORTS = 'shorts',
	SPOT = 'spot',
}

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Overview: FC = () => {
	const { t } = useTranslation();

	const { useExchangeRatesQuery, useSynthsBalancesQuery } = useSynthetixQueries();

	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const markets = futuresMarkets.map(({ asset }) => MarketKeyByAsset[asset]);
	const portfolioValueQuery = useGetCurrentPortfolioValue(markets);
	const portfolioValue = portfolioValueQuery?.data ?? null;

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const walletAddress = useRecoilValue(walletAddressState);
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(PositionsTab.FUTURES);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const totalSpotBalancesValue = formatCurrency(
		Synths.sUSD,
		wei(synthBalances?.totalUSDBalance ?? zeroBN),
		{ sign: '$' }
	);

	const totalFuturesPortfolioValue = formatCurrency(Synths.sUSD, wei(portfolioValue ?? zeroBN), {
		sign: '$',
	});

	const POSITIONS_TABS = useMemo(
		() => [
			{
				name: PositionsTab.FUTURES,
				label: t('dashboard.overview.positions-tabs.futures'),
				badge: futuresPositionQuery?.data?.length,
				active: activePositionsTab === PositionsTab.FUTURES,
				detail: totalFuturesPortfolioValue,
				disabled: false,
				onClick: () => {
					setActivePositionsTab(PositionsTab.FUTURES);
				},
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: totalSpotBalancesValue,
				disabled: false,
				onClick: () => {
					setActivePositionsTab(PositionsTab.SPOT);
				},
			},
		],
		[
			activePositionsTab,
			futuresPositionQuery?.data?.length,
			t,
			totalFuturesPortfolioValue,
			totalSpotBalancesValue,
		]
	);

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures'),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.FUTURES);
				},
			},
			{
				name: MarketsTab.SPOT,
				label: t('dashboard.overview.markets-tabs.spot'),
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	return (
		<>
			<PortfolioChart />

			<TabButtonsContainer>
				{POSITIONS_TABS.map(({ name, label, ...rest }) => (
					<TabButton key={name} title={label} {...rest} />
				))}
			</TabButtonsContainer>
			<TabPanel name={PositionsTab.FUTURES} activeTab={activePositionsTab}>
				<FuturesPositionsTable futuresPositionHistory={futuresPositionHistory} />
			</TabPanel>

			<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
				<SynthBalancesTable
					synthBalances={synthBalances?.balances ?? []}
					exchangeRates={exchangeRates}
				/>
			</TabPanel>

			<TabButtonsContainer>
				{MARKETS_TABS.map(({ name, label, active, onClick }) => (
					<TabButton key={name} title={label} active={active} onClick={onClick} />
				))}
			</TabButtonsContainer>
			<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
				<FuturesMarketsTable />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
				<SpotMarketsTable exchangeRates={exchangeRates} />
			</TabPanel>
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default Overview;
