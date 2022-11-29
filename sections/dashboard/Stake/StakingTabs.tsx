import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { DropdownIndicator, IndicatorSeparator } from 'components/Select/Select';
import { TabPanel } from 'components/Tab';
import useIsL2 from 'hooks/useIsL2';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { setSelectedEpoch } from 'state/staking/reducer';
import { selectEpochData, selectSelectedEpoch } from 'state/staking/selectors';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';

import EscrowTab from './EscrowTab';
import RedemptionTab from './RedemptionTab';
import StakingTab from './StakingTab';
import TradingRewardsTab from './TradingRewardsTab';

type EpochValue = {
	period: number;
	start: number;
	end: number;
	label: string;
};

enum StakeTab {
	Staking = 'staking',
	TradingRewards = 'trading-rewards',
	Escrow = 'escrow',
	Redemption = 'redemption',
}

const StakingTabs: React.FC = () => {
	const { t } = useTranslation();
	const isL2 = useIsL2();
	const dispatch = useAppDispatch();

	const [activeTab, setActiveTab] = useState(StakeTab.Staking);

	const epochData = useAppSelector(selectEpochData);
	const selectedEpoch = useAppSelector(selectSelectedEpoch);

	const handleTabSwitch = useCallback(
		(tab: StakeTab) => () => {
			setActiveTab(tab);
		},
		[]
	);

	const handleChangeEpoch = useCallback(
		(value: EpochValue) => () => {
			dispatch(setSelectedEpoch(value.period));
		},
		[dispatch]
	);

	const formatOptionLabel = useCallback(
		(option: EpochValue) => (
			<div onClick={handleChangeEpoch(option)}>
				<SelectLabelContainer>{option.label}</SelectLabelContainer>
			</div>
		),
		[handleChangeEpoch]
	);

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
						title={
							window.innerWidth > 768
								? t('dashboard.stake.tabs.trading-rewards.title')
								: t('dashboard.stake.tabs.trading-rewards.mobile-title')
						}
						onClick={handleTabSwitch(StakeTab.TradingRewards)}
						active={activeTab === StakeTab.TradingRewards}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.escrow.title')}
						onClick={handleTabSwitch(StakeTab.Escrow)}
						active={activeTab === StakeTab.Escrow}
					/>
					<TabButton
						title={t('dashboard.stake.tabs.redemption.title')}
						onClick={handleTabSwitch(StakeTab.Redemption)}
						active={activeTab === StakeTab.Redemption}
					/>
				</TabButtons>
				<StyledFlexDivRowCentered active={activeTab === StakeTab.TradingRewards}>
					{window.innerWidth < 768 && (
						<PeriodLabel>{t('dashboard.stake.tabs.staking.current-trading-period')}</PeriodLabel>
					)}

					<StakingSelect
						formatOptionLabel={formatOptionLabel}
						controlHeight={41}
						options={epochData.sort((a, b) => b.period - a.period)}
						optionPadding={'0px'}
						value={selectedEpoch}
						menuWidth={240}
						components={{ IndicatorSeparator, DropdownIndicator }}
						isSearchable={false}
						variant="flat"
						isDisabled={!isL2}
					></StakingSelect>
				</StyledFlexDivRowCentered>
			</StakingTabsHeader>

			<div>
				<TabPanel name={StakeTab.Staking} activeTab={activeTab}>
					<StakingTab />
				</TabPanel>
				<TabPanel name={StakeTab.TradingRewards} activeTab={activeTab}>
					<TradingRewardsTab
						period={selectedEpoch.period}
						start={selectedEpoch.start}
						end={selectedEpoch.end}
					/>
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

const SelectLabelContainer = styled(LabelContainer)`
	font-size: 12px;
`;

const StakingSelect = styled(Select)`
	height: 38px;
	width: 100%;
	.react-select__control,
	.react-select__menu,
	.react-select__menu-list {
		border-radius: 20px;
	}

	.react-select__value-container {
		padding: 0;
	}

	.react-select__single-value > div > div {
		font-size: 12px;
	}

	.react-select__dropdown-indicator {
		margin-right: 10px;
	}
`;

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)<{ active: boolean }>`
	display: ${(props) => (props.active ? 'flex' : 'none')};
	width: 24%;
	${media.lessThan('md')`
		width: unset;
	`}
`;

const PeriodLabel = styled.div`
	font-size: 11px;
	line-height: 11px;
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	margin-left: 4px;
	width: 50%;
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
