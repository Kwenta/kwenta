import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { TabPanel } from 'components/Tab';
import { FuturesAccountTypes } from 'queries/futures/types';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { balancesState, portfolioState, positionsState, ratesState } from 'store/futures';
import { activePositionsTabState } from 'store/ui';
import { formatDollars } from 'utils/formatters/number';

import FuturesMarketsTable from '../FuturesMarketsTable';
import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import MobileDashboard from '../MobileDashboard';
import PortfolioChart from '../PortfolioChart';
import SpotMarketsTable from '../SpotMarketsTable';
import SynthBalancesTable from '../SynthBalancesTable';

export enum PositionsTab {
	CROSS_MARGIN = 'cross margin',
	ISOLATED_MARGIN = 'isolated margin',
	SPOT = 'spot',
}

const Overview: FC = () => {
	const { t } = useTranslation();

	const balances = useRecoilValue(balancesState);
	const portfolio = useRecoilValue(portfolioState);
	const exchangeRates = useRecoilValue(ratesState);
	const positions = useRecoilValue(positionsState);

	const [activePositionsTab, setActivePositionsTab] = useRecoilState<PositionsTab>(
		activePositionsTabState
	);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const POSITIONS_TABS = useMemo(
		() => [
			{
				name: PositionsTab.CROSS_MARGIN,
				label: t('dashboard.overview.positions-tabs.cross-margin'),
				badge: positions[FuturesAccountTypes.CROSS_MARGIN].length,
				active: activePositionsTab === PositionsTab.CROSS_MARGIN,
				detail: formatDollars(portfolio.crossMarginFutures),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.CROSS_MARGIN),
			},
			{
				name: PositionsTab.ISOLATED_MARGIN,
				label: t('dashboard.overview.positions-tabs.isolated-margin'),
				badge: positions[FuturesAccountTypes.ISOLATED_MARGIN].length,
				active: activePositionsTab === PositionsTab.ISOLATED_MARGIN,
				detail: formatDollars(portfolio.isolatedMarginFutures),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.ISOLATED_MARGIN),
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: formatDollars(balances.totalUSDBalance),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		],
		[positions, balances, activePositionsTab, setActivePositionsTab, t, portfolio]
	);

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures'),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => setActiveMarketsTab(MarketsTab.FUTURES),
			},
			{
				name: MarketsTab.SPOT,
				label: t('dashboard.overview.markets-tabs.spot'),
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => setActiveMarketsTab(MarketsTab.SPOT),
			},
		],
		[activeMarketsTab, setActiveMarketsTab, t]
	);

	return (
		<>
			<DesktopOnlyView>
				<CompetitionBanner />

				<PortfolioChart />

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, ...rest }) => (
						<TabButton key={name} title={label} {...rest} />
					))}
				</TabButtonsContainer>
				<TabPanel name={PositionsTab.CROSS_MARGIN} activeTab={activePositionsTab}>
					<FuturesPositionsTable accountType={FuturesAccountTypes.CROSS_MARGIN} />
				</TabPanel>

				<TabPanel name={PositionsTab.ISOLATED_MARGIN} activeTab={activePositionsTab}>
					<FuturesPositionsTable accountType={FuturesAccountTypes.ISOLATED_MARGIN} />
				</TabPanel>

				<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
					<SynthBalancesTable />
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
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileDashboard />
			</MobileOrTabletView>
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
