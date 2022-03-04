import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabList, TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';

enum PositionsTab {
	FUTURES = 'futures',
	SHORTS = 'shorts',
	SPOT = 'spot'
}

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot'
}

const PositionsTabs = Object.values(PositionsTab);
const MarketsTabs = Object.values(MarketsTab);

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
				onClick: () => {},
			},
			{
				name: PositionsTab.SHORTS,
				label: 'Shorts',
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SHORTS,
				onClick: () => { },
			},
			{
				name: PositionsTab.SPOT,
				label: 'Spot Balances',
				badge: 3,
				disabled: true,
				active: activePositionsTab === PositionsTab.SPOT,
				onClick: () => { },
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
				onClick: () => { },
			},
			{
				name: MarketsTab.SPOT,
				label: 'Spot Markets',
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => { },
			},
		],
		[activeMarketsTab]
	);

	return (
		<>
			{/* Chart */}

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

			{/* Positions / Shorts / Spot Balances Table */}

			<TabButtonsContainer>
				{MARKETS_TABS.map(({ name, label, badge, active, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						onClick={onClick}
					/>
				))}
			</TabButtonsContainer>
			{/* Futures Markets / Spot Markets Table */}
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
