import { FC, useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import PortfolioChart from '../PortfolioChart';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import FuturesPositionsTable from '../FuturesPositionsTable';
import FuturesMarketsTable from '../FuturesMarketsTable';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';
import SynthBalancesTable from '../SynthBalancesTable';
import { wei } from '@synthetixio/wei';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { NetworkIdByName, Synths } from '@synthetixio/contracts-interface';
import { getMarketKey } from 'utils/futures';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import Connector from 'containers/Connector';
import SpotMarketsTable from '../SpotMarketsTable';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';

enum PositionsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
	SWITCH = 'switch',
}

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Overview: FC = () => {
	const { t } = useTranslation();

	const { useExchangeRatesQuery, useSynthsBalancesQuery } = useSynthetixQueries();

	const { network } = Connector.useContainer();

	const isL2MainnetOrL2Kovan =
		network.id === NetworkIdByName['mainnet-ovm'] || network.id === NetworkIdByName['kovan-ovm'];

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	const markets = futuresMarkets.map(({ asset }) => getMarketKey(asset, network.id));
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

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(
		isL2MainnetOrL2Kovan ? PositionsTab.FUTURES : PositionsTab.SPOT
	);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	useEffect(() => {
		if (isL2MainnetOrL2Kovan) {
			setActivePositionsTab(PositionsTab.FUTURES);
		} else {
			setActivePositionsTab(PositionsTab.SPOT);
		}
	}, [isL2MainnetOrL2Kovan]);

	const { switchToL2 } = useNetworkSwitcher();

	const totalSpotBalancesValue = formatCurrency(
		Synths.sUSD,
		wei(synthBalances?.totalUSDBalance ?? zeroBN),
		{
			sign: '$',
		}
	);

	const totalFuturesPortfolioValue = formatCurrency(Synths.sUSD, wei(portfolioValue ?? zeroBN), {
		sign: '$',
	});

	const POSITIONS_TABS = useMemo(
		() =>
			isL2MainnetOrL2Kovan
				? [
						{
							name: PositionsTab.FUTURES,
							label: t('dashboard.overview.positions-tabs.futures'),
							badge: futuresPositionQuery?.data?.length,
							active: activePositionsTab === PositionsTab.FUTURES,
							detail: totalFuturesPortfolioValue,
							onClick: () => {
								setActivePositionsTab(PositionsTab.FUTURES);
							},
						},
						{
							name: PositionsTab.SPOT,
							label: t('dashboard.overview.positions-tabs.spot'),
							active: activePositionsTab === PositionsTab.SPOT,
							detail: totalSpotBalancesValue,
							onClick: () => {
								setActivePositionsTab(PositionsTab.SPOT);
							},
						},
				  ]
				: [
						{
							name: PositionsTab.SPOT,
							label: t('dashboard.overview.positions-tabs.spot'),
							active: activePositionsTab === PositionsTab.SPOT,
							detail: totalSpotBalancesValue,
							onClick: () => {
								setActivePositionsTab(PositionsTab.SPOT);
							},
						},
						{
							name: PositionsTab.SWITCH,
							label: t('dashboard.overview.positions-tabs.switch-to-l2'),
							active: true,
							detail: '',
							onClick: switchToL2,
						},
				  ],
		[
			activePositionsTab,
			futuresPositionQuery?.data?.length,
			isL2MainnetOrL2Kovan,
			switchToL2,
			t,
			totalFuturesPortfolioValue,
			totalSpotBalancesValue,
		]
	);

	const MARKETS_TABS = useMemo(
		() =>
			isL2MainnetOrL2Kovan
				? [
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
				  ]
				: [
						{
							name: MarketsTab.SPOT,
							label: t('dashboard.overview.markets-tabs.spot'),
							active: activeMarketsTab === MarketsTab.SPOT,
							onClick: () => {
								setActiveMarketsTab(MarketsTab.SPOT);
							},
						},
				  ],
		[activeMarketsTab, isL2MainnetOrL2Kovan, t]
	);

	return (
		<>
			<PortfolioChart
				totalFuturesPortfolioValue={portfolioValue ?? zeroBN}
				totalSpotBalanceValue={synthBalances?.totalUSDBalance ?? zeroBN}
				totalShortsValue={zeroBN}
			/>

			<TabButtonsContainer hasDetail={true}>
				{POSITIONS_TABS.map(({ name, label, badge, active, detail, onClick }) => (
					<TabButton
						key={name}
						title={label}
						badge={badge}
						active={active}
						detail={detail}
						onClick={onClick}
					/>
				))}
			</TabButtonsContainer>
			<TabPanel name={PositionsTab.FUTURES} activeTab={activePositionsTab}>
				<FuturesPositionsTable
					futuresMarkets={futuresMarkets}
					futuresPositionHistory={futuresPositionHistory}
				/>
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
				<FuturesMarketsTable futuresMarkets={futuresMarkets} />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
				<SpotMarketsTable exchangeRates={exchangeRates} />
			</TabPanel>
		</>
	);
};

const TabButtonsContainer = styled.div<{ hasDetail?: boolean }>`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		height: ${(props) => (props.hasDetail ? '48px' : '38px')};
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default Overview;
