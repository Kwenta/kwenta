import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import media from 'styles/media';

import EscrowTab from './EscrowTab';
import StakingTab from './StakingTab';
import TradingRewardsTab from './TradingRewardsTab';

enum StakeTab {
	Staking = 'staking',
	TradingRewards = 'trading-rewards',
	Escrow = 'escrow',
}

const StakingTabs: React.FC = () => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState(StakeTab.Staking);
	const handleTabSwitch = useCallback((tab: StakeTab) => () => setActiveTab(tab), []);

	return (
		<StakingTabsContainer>
			<StakingTabsHeader>
				<TabButtons>
					<TabButton
						title={t('dashboard.stake.tabs.staking.title')}
						onClick={handleTabSwitch(StakeTab.Staking)}
						active={activeTab === StakeTab.Staking}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.trading-rewards.title')}
						onClick={handleTabSwitch(StakeTab.TradingRewards)}
						active={activeTab === StakeTab.TradingRewards}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.escrow.title')}
						onClick={handleTabSwitch(StakeTab.Escrow)}
						active={activeTab === StakeTab.Escrow}
					/>
				</TabButtons>
				<EpochLabel
					title={t('dashboard.stake.tabs.trading-rewards.epoch')}
					active={activeTab === StakeTab.TradingRewards}
					isRounded
				/>
			</StakingTabsHeader>

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
		</StakingTabsContainer>
	);
};

const EpochLabel = styled(TabButton)`
	& p {
		font-size: 10px;
		line-height: 100%;
	}
	margin-top: 4px;
	margin-bottom: 4px;
	align-items: center;
	visibility: ${(props) => (props.active ? 'visible' : 'hidden')};
	border-radius: ${(props) => (props.isRounded ? '50px' : '8px')};
	transition-duration: 0s;
`;

const StakingTabsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;
`;

const StakingTabsContainer = styled.div`
	${media.lessThan('md')`
		padding: 15px;
	`}
`;

const TabButtons = styled.div`
	display: flex;

	& > button:not(:last-of-type) {
		margin-right: 8px;
	}
`;

export default StakingTabs;
