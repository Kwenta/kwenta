import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';
import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
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
	const { epochPeriod } = useStakingContext();
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
					{window.innerWidth < 768 && <PeriodLabel>{'Current Trading Period:'}</PeriodLabel>}
					<StyledFlexDivRow>
						<EpochLabel
							title={t('dashboard.stake.tabs.trading-rewards.epoch', { EpochPeriod: epochPeriod })}
							active={activeTab === StakeTab.TradingRewards}
							isRounded
						/>
						{window.innerWidth < 768 && <CaretDownGrayIcon />}
					</StyledFlexDivRow>
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

const StyledFlexDivRow = styled(FlexDivRow)`
	align-items: center;
	margin-right: 4px;
`;

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)<{ active: boolean }>`
	display: ${(props) => (props.active ? 'flex' : 'none')};
`;

const PeriodLabel = styled.div`
	font-size: 11px;
	line-height: 11px;
	display: flex;
	align-items: center;
	color: #b1b1b1;
	margin-left: 4px;
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

	${media.lessThan('md')`
		background: none;
		flex-direction: column;
		color: #b1b1b1;
		font-weight: 700px;
		border-width: 0px;
		text-transform: uppercase;
		font-size: 14px;
		line-height: 14px;
		margin-left: 0px;
	`}
`;

const StakingTabsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;

	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 10px;
		margin-bottom: 10px;
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

	${media.lessThan('md')`
		justify-content: space-around;
	`}
`;

export default StakingTabs;
