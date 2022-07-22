import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { Synths } from 'constants/currency';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { futuresMarketsState } from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';

import FuturesPositionsTable from '../FuturesPositionsTable';
import SynthBalancesTable from '../SynthBalancesTable';

enum PositionsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const OpenPositions: React.FC = () => {
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

	const [activePositionsTab, setActivePositionsTab] = React.useState<PositionsTab>(
		PositionsTab.FUTURES
	);

	const totalSpotBalancesValue = formatCurrency(
		Synths.sUSD,
		wei(synthBalances?.totalUSDBalance ?? zeroBN),
		{ sign: '$' }
	);

	const totalFuturesPortfolioValue = formatCurrency(Synths.sUSD, wei(portfolioValue ?? zeroBN), {
		sign: '$',
	});

	const POSITIONS_TABS = React.useMemo(
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

	return (
		<div>
			<div style={{ margin: '15px 15px 30px 15px' }}>
				<SectionHeader>
					<SectionTitle>Open Positions</SectionTitle>
				</SectionHeader>

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, ...rest }) => (
						<TabButton key={name} title={label} {...rest} />
					))}
				</TabButtonsContainer>
			</div>

			<TabPanel name={PositionsTab.FUTURES} activeTab={activePositionsTab}>
				<FuturesPositionsTable
					futuresPositionHistory={futuresPositionHistory}
					showCurrentMarket={true}
				/>
			</TabPanel>

			<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
				<SynthBalancesTable
					synthBalances={synthBalances?.balances ?? []}
					exchangeRates={exchangeRates}
				/>
			</TabPanel>
		</div>
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

export default OpenPositions;
