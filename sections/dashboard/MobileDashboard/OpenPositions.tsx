import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import Connector from 'containers/Connector';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { positionsState, ratesState } from 'store/futures';
import { formatDollars, zeroBN } from 'utils/formatters/number';

import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import SynthBalancesTable from '../SynthBalancesTable';

type OpenPositionsProps = {
	activePositionsTab: MarketsTab;
	setActivePositionsTab: SetterOrUpdater<MarketsTab>;
};

const OpenPositions: React.FC<OpenPositionsProps> = ({
	activePositionsTab,
	setActivePositionsTab,
}) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const portfolioValueQuery = useGetCurrentPortfolioValue();
	const portfolioValue = portfolioValueQuery?.data ?? null;

	const exchangeRates = useRecoilValue(ratesState);
	const futuresPositions = useRecoilValue(positionsState);

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const totalSpotBalancesValue = formatDollars(wei(synthBalances?.totalUSDBalance ?? zeroBN));

	const totalFuturesPortfolioValue = formatDollars(wei(portfolioValue ?? zeroBN));

	const POSITIONS_TABS = React.useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.positions-tabs.futures'),
				badge: futuresPositions.length,
				active: activePositionsTab === MarketsTab.FUTURES,
				detail: totalFuturesPortfolioValue,
				disabled: false,
				onClick: () => setActivePositionsTab(MarketsTab.FUTURES),
			},
			{
				name: MarketsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === MarketsTab.SPOT,
				detail: totalSpotBalancesValue,
				disabled: false,
				onClick: () => setActivePositionsTab(MarketsTab.SPOT),
			},
		],
		[
			futuresPositions,
			activePositionsTab,
			setActivePositionsTab,
			t,
			totalFuturesPortfolioValue,
			totalSpotBalancesValue,
		]
	);

	return (
		<div>
			<div style={{ margin: '15px 15px 30px 15px' }}>
				<SectionHeader>
					<SectionTitle>{t('dashboard.overview.mobile.open-positions')}</SectionTitle>
				</SectionHeader>

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, ...rest }) => (
						<TabButton key={name} title={label} {...rest} />
					))}
				</TabButtonsContainer>
			</div>

			<TabPanel name={MarketsTab.FUTURES} activeTab={activePositionsTab}>
				<FuturesPositionsTable showCurrentMarket={true} />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activePositionsTab}>
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
