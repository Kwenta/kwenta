import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';

import EscrowTab from './EscrowTab';
import StakingTab from './StakingTab';
import TradingRewardsTab from './TradingRewardsTab';

enum StakeTab {
	Staking = 'staking',
	TradingRewards = 'trading-rewards',
	Escrow = 'escrow',
}

const StakingTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState<StakeTab>(StakeTab.Staking);

	const handleTabSwitch = React.useCallback(
		(tab: StakeTab) => () => {
			setActiveTab(tab);
		},
		[]
	);

	return (
		<div>
			<TabButtons>
				<TabButton
					title="Staking"
					onClick={handleTabSwitch(StakeTab.Staking)}
					active={activeTab === StakeTab.Staking}
				/>
				<TabButton
					title="Trading Rewards"
					onClick={handleTabSwitch(StakeTab.TradingRewards)}
					active={activeTab === StakeTab.TradingRewards}
				/>
				<TabButton
					title="Escrow"
					onClick={handleTabSwitch(StakeTab.Escrow)}
					active={activeTab === StakeTab.Escrow}
				/>
			</TabButtons>

			<div>
				<TabPanel name={StakeTab.Staking} activeTab={activeTab}>
					<StakingTab />
				</TabPanel>
				<TabPanel name={StakeTab.TradingRewards} activeTab={activeTab}>
					<TradingRewardsTab />
				</TabPanel>
				<TabPanel name={StakeTab.Escrow} activeTab={activeTab}>
					<EscrowTab />
				</TabPanel>
			</div>
		</div>
	);
};

const TabButtons = styled.div`
	display: flex;
	margin-bottom: 20px;

	& > button:not(:last-of-type) {
		margin-right: 8px;
	}
`;

export default StakingTabs;
