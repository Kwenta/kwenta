import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import PortfolioChart from '../PortfolioChart';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import FuturesPositionsTable from '../FuturesPositionsTable';
import FuturesMarketsTable from '../FuturesMarketsTable';

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

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(PositionsTab.FUTURES);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const POSITIONS_TABS = useMemo(
		() => [
			{
				name: PositionsTab.FUTURES,
				label: t('dashboard.overview.positions-tabs.futures'),
				badge: futuresPositionQuery?.data?.length,
				active: activePositionsTab === PositionsTab.FUTURES,
				onClick: () => {
					setActivePositionsTab(PositionsTab.FUTURES);
				},
			},
			{
				name: PositionsTab.SHORTS,
				label: t('dashboard.overview.positions-tabs.shorts'),
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SHORTS,
				onClick: () => {
					setActivePositionsTab(PositionsTab.SHORTS);
				},
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SPOT,
				onClick: () => {
					setActivePositionsTab(PositionsTab.SPOT);
				},
			},
		],
		[activePositionsTab, futuresPositionQuery?.data, t]
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
				disabled: true,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	return (
		<>
			<PortfolioChart futuresMarkets={futuresMarkets} />

			<TabButtonsContainer>
				{POSITIONS_TABS.map(({ name, label, badge, active, disabled, onClick }) => (
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
			<TabPanel name={PositionsTab.FUTURES} activeTab={activePositionsTab}>
				<FuturesPositionsTable
					futuresMarkets={futuresMarkets}
					futuresPositionHistory={futuresPositionHistory}
				/>
			</TabPanel>

			<TabPanel name={PositionsTab.SHORTS} activeTab={activePositionsTab}></TabPanel>

			<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}></TabPanel>

			<TabButtonsContainer>
				{MARKETS_TABS.map(({ name, label, active, disabled, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						disabled={disabled}
						onClick={onClick}
					/>
				))}
			</TabButtonsContainer>
			<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
				<FuturesMarketsTable futuresMarkets={futuresMarkets} />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}></TabPanel>
		</>
	);
};

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

export default Overview;
