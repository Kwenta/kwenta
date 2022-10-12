import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { currentThemeState } from 'store/ui';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';

import EscrowTab from './EscrowTab';
import RedemptionTab from './RedemptionTab';
import StakingTab from './StakingTab';
import TradingRewardsTab from './TradingRewardsTab';

enum StakeTab {
	Staking = 'staking',
	TradingRewards = 'trading-rewards',
	Escrow = 'escrow',
	Redemption = 'redemption',
}

const StakingTabs: React.FC = () => {
	const { t } = useTranslation();
	const epochPeriod = 5;
	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

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
						lightStakePage={!isDarkTheme}
					/>
					<TabButton
						title={
							window.innerWidth > 768
								? t('dashboard.stake.tabs.trading-rewards.title')
								: t('dashboard.stake.tabs.trading-rewards.mobile-title')
						}
						onClick={handleTabSwitch(StakeTab.TradingRewards)}
						active={activeTab === StakeTab.TradingRewards}
						lightStakePage={!isDarkTheme}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.escrow.title')}
						onClick={handleTabSwitch(StakeTab.Escrow)}
						active={activeTab === StakeTab.Escrow}
						lightStakePage={!isDarkTheme}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.redemption.title')}
						onClick={handleTabSwitch(StakeTab.Redemption)}
						active={activeTab === StakeTab.Redemption}
						lightStakePage={!isDarkTheme}
					/>
				</TabButtons>
				<StyledFlexDivRowCentered active={activeTab === StakeTab.TradingRewards}>
					{window.innerWidth < 768 && (
						<EpochLabel
							title={'Current Trading Period:'}
							active={activeTab === StakeTab.TradingRewards}
						/>
					)}
					<EpochLabel
						title={t('dashboard.stake.tabs.trading-rewards.epoch', { EpochPeriod: epochPeriod })}
						active={activeTab === StakeTab.TradingRewards}
						isRounded
					/>
				</StyledFlexDivRowCentered>
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
				<TabPanel name={StakeTab.Redemption} activeTab={activeTab}>
					<RedemptionTab />
				</TabPanel>
			</div>
		</StakingTabsContainer>
	);
};

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)<{ active: boolean }>`
	display: ${(props) => (props.active ? 'flex' : 'none')};
`;

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

	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 20px;
	`}
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
