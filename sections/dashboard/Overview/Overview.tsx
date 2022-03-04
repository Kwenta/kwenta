import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import PortfolioChart from '../PortfolioChart';

enum PositionsTab {
	FUTURES = 'futures',
	SHORTS = 'shorts',
	SPOT = 'spot'
}

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot'
}

const Overview: FC = () => {
	const { t } = useTranslation();
	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(PositionsTab.FUTURES);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);
	
	const POSITIONS_TABS = useMemo(
		() => [
			{
				name: PositionsTab.FUTURES,
				label: 'Futures Positions',
				badge: 3,
				active: activePositionsTab === PositionsTab.FUTURES,
				onClick: () => { setActivePositionsTab(PositionsTab.FUTURES) },
			},
			{
				name: PositionsTab.SHORTS,
				label: 'Shorts',
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SHORTS,
				onClick: () => { setActivePositionsTab(PositionsTab.SHORTS) },
			},
			{
				name: PositionsTab.SPOT,
				label: 'Spot Balances',
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SPOT,
				onClick: () => { setActivePositionsTab(PositionsTab.SPOT) },
			},
		],
		[activePositionsTab]
	);

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: 'Futures Markets',
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => { setActiveMarketsTab(MarketsTab.FUTURES) },
			},
			{
				name: MarketsTab.SPOT,
				label: 'Spot Markets',
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => { setActiveMarketsTab(MarketsTab.SPOT) },
			},
		],
		[activeMarketsTab]
	);

	return (
		<>
			<PortfolioChart />

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
			</TabPanel>

			<TabPanel name={PositionsTab.SHORTS} activeTab={activePositionsTab}>
			</TabPanel>

			<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
			</TabPanel>

			<TabButtonsContainer>
				{MARKETS_TABS.map(({ name, label, active, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						onClick={onClick}
					/>
				))}
			</TabButtonsContainer>
			<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
			</TabPanel>
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
