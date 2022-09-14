import React from 'react';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';

type Tab = 'staking' | 'trading-rewards' | 'escrow';

enum StakingTab {
	Staking = 'staking',
	TradingRewards = 'trading-rewards',
	Escrow = 'escrow',
}

const StakingTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState<Tab>('staking');

	const handleTabSwitch = React.useCallback(
		(tab: Tab) => () => {
			setActiveTab(tab);
		},
		[]
	);

	return (
		<div>
			<div>
				<TabButton
					title="Staking"
					onClick={handleTabSwitch('staking')}
					active={activeTab === 'staking'}
				/>
				<TabButton
					title="Trading Rewards"
					onClick={handleTabSwitch('trading-rewards')}
					active={activeTab === 'trading-rewards'}
				/>
				<TabButton
					title="Escrow"
					onClick={handleTabSwitch('escrow')}
					active={activeTab === 'escrow'}
				/>
			</div>

			<div>
				<TabPanel name="staking" activeTab={activeTab}>
					<div />
				</TabPanel>
				<TabPanel name="trading-rewards" activeTab={activeTab}>
					<div />
				</TabPanel>
				<TabPanel name="escrow" activeTab={activeTab}>
					<div />
				</TabPanel>
			</div>
		</div>
	);
};

export default StakingTabs;
