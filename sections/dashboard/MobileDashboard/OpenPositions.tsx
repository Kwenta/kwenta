import Wei from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { FuturesAccountTypes } from 'queries/futures/types';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { selectBalances } from 'state/balances/selectors';
import {
	// selectCrossMarginPositions,
	selectFuturesPortfolio,
	selectIsolatedMarginPositions,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import { PositionsTab } from '../Overview/Overview';
import SynthBalancesTable from '../SynthBalancesTable';

export type OpenPositionsProps = {
	activePositionsTab: PositionsTab;
	setActivePositionsTab: SetterOrUpdater<PositionsTab>;
	exchangeTokens: {
		synth: string;
		description: string;
		balance: Wei;
		usdBalance: Wei;
		price: Wei;
		priceChange: Wei;
	}[];
	exchangeTokenBalances: Wei;
};

const OpenPositions: React.FC<OpenPositionsProps> = ({
	activePositionsTab,
	setActivePositionsTab,
	exchangeTokens,
	exchangeTokenBalances,
}) => {
	const { t } = useTranslation();
	// const crossPositions = useAppSelector(selectCrossMarginPositions);
	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const balances = useAppSelector(selectBalances);

	const POSITIONS_TABS = useMemo(
		() => [
			// {
			// 	name: PositionsTab.CROSS_MARGIN,
			// 	label: t('dashboard.overview.positions-tabs.cross-margin'),
			// 	badge: crossPositions.length,
			// 	active: activePositionsTab === PositionsTab.CROSS_MARGIN,
			// 	detail: formatDollars(portfolio.crossMarginFutures),
			// 	disabled: false,
			// 	onClick: () => setActivePositionsTab(PositionsTab.CROSS_MARGIN),
			// },
			{
				name: PositionsTab.ISOLATED_MARGIN,
				label: t('dashboard.overview.positions-tabs.isolated-margin'),
				badge: isolatedPositions.length,
				active: activePositionsTab === PositionsTab.ISOLATED_MARGIN,
				detail: formatDollars(portfolio.isolatedMarginFutures),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.ISOLATED_MARGIN),
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: formatDollars(balances.totalUSDBalance.add(exchangeTokenBalances)),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		],
		[
			t,
			isolatedPositions,
			// crossPositions,
			activePositionsTab,
			// portfolio.crossMarginFutures,
			portfolio.isolatedMarginFutures,
			balances.totalUSDBalance,
			exchangeTokenBalances,
			setActivePositionsTab,
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

			<TabPanel name={PositionsTab.CROSS_MARGIN} activeTab={activePositionsTab}>
				<FuturesPositionsTable accountType={FuturesAccountTypes.CROSS_MARGIN} />
			</TabPanel>

			<TabPanel name={PositionsTab.ISOLATED_MARGIN} activeTab={activePositionsTab}>
				<FuturesPositionsTable accountType={FuturesAccountTypes.ISOLATED_MARGIN} />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activePositionsTab}>
				<SynthBalancesTable exchangeTokens={exchangeTokens} />
			</TabPanel>
		</div>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin: 16px 0;

	& > button:not(:last-of-type) {
		margin-right: 14px;
	}
`;

export default OpenPositions;
