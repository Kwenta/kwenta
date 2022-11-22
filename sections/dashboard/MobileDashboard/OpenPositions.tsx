import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { FuturesAccountTypes } from 'queries/futures/types';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { balancesState, portfolioState, positionsState } from 'store/futures';
import { formatDollars, toWei } from 'utils/formatters/number';

import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import { PositionsTab } from '../Overview/Overview';
import SynthBalancesTable from '../SynthBalancesTable';

type OpenPositionsProps = {
	activePositionsTab: PositionsTab;
	setActivePositionsTab: SetterOrUpdater<PositionsTab>;
	exchangeTokens?: any;
	exchangeTokenBalances?: number;
};

const OpenPositions: React.FC<OpenPositionsProps> = ({
	activePositionsTab,
	setActivePositionsTab,
	exchangeTokens = [],
	exchangeTokenBalances = 0,
}) => {
	const { t } = useTranslation();
	const positions = useRecoilValue(positionsState);
	const portfolio = useRecoilValue(portfolioState);
	const balances = useRecoilValue(balancesState);

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
				detail: formatDollars(
					balances.totalUSDBalance.add(toWei(exchangeTokenBalances.toString()))
				),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		],
		[
			t,
			positions,
			activePositionsTab,
			portfolio.crossMarginFutures,
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
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default OpenPositions;
