import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { FlexDivRowCentered } from 'components/layout/flex'
import LabelContainer from 'components/Nav/DropDownLabel'
import Select from 'components/Select'
import { DropdownIndicator, IndicatorSeparator } from 'components/Select'
import { TabPanel } from 'components/Tab'
import useIsL2 from 'hooks/useIsL2'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setSelectedEpoch } from 'state/staking/reducer'
import { selectEpochData, selectSelectedEpoch } from 'state/staking/selectors'
import media from 'styles/media'

import RewardsTabs from '../RewardsTabs'

import EscrowTab from './EscrowTab'
import RedemptionTab from './RedemptionTab'
import { StakeTab } from './StakingPortfolio'
import StakingTab from './StakingTab'

type EpochValue = {
	period: number
	start: number
	end: number
	label: string
}

type StakingTabsProp = {
	currentTab: StakeTab
	onChangeTab(tab: StakeTab): () => void
}

const StakingTabs: React.FC<StakingTabsProp> = ({ currentTab, onChangeTab }) => {
	const { t } = useTranslation()
	const isL2 = useIsL2()
	const dispatch = useAppDispatch()

	const epochData = useAppSelector(selectEpochData)
	const selectedEpoch = useAppSelector(selectSelectedEpoch)

	const handleChangeEpoch = useCallback(
		(value: EpochValue) => () => {
			dispatch(setSelectedEpoch(value.period))
		},
		[dispatch]
	)

	const formatOptionLabel = useCallback(
		(option: EpochValue) => (
			<div onClick={handleChangeEpoch(option)}>
				<SelectLabelContainer>{option.label}</SelectLabelContainer>
			</div>
		),
		[handleChangeEpoch]
	)

	return (
		<StakingTabsContainer>
			<StakingTabsHeader>
				<TabButtons>
					<TabButton
						noOutline
						title={t('dashboard.stake.tabs.staking.title')}
						onClick={onChangeTab(StakeTab.Staking)}
						active={currentTab === StakeTab.Staking}
					/>
					<TabButton
						noOutline
						title={t('dashboard.stake.tabs.escrow.title')}
						onClick={onChangeTab(StakeTab.Escrow)}
						active={currentTab === StakeTab.Escrow}
					/>
					<TabButton
						noOutline
						title={t('dashboard.stake.tabs.redemption.title')}
						onClick={onChangeTab(StakeTab.Redemption)}
						active={currentTab === StakeTab.Redemption}
					/>
				</TabButtons>
				<StyledFlexDivRowCentered active={currentTab === StakeTab.TradingRewards}>
					{window.innerWidth < 768 && (
						<PeriodLabel>{t('dashboard.stake.tabs.staking.current-trading-period')}</PeriodLabel>
					)}

					<StakingSelect
						formatOptionLabel={formatOptionLabel}
						controlHeight={41}
						options={epochData.sort((a, b) => b.period - a.period)}
						optionPadding="0px"
						value={selectedEpoch}
						menuWidth={240}
						components={{ IndicatorSeparator, DropdownIndicator }}
						isSearchable={false}
						variant="flat"
						isDisabled={!isL2}
					/>
				</StyledFlexDivRowCentered>
			</StakingTabsHeader>

			<div>
				<TabPanel name={StakeTab.Staking} activeTab={currentTab}>
					<StakingTab />
					<RewardsTabs />
				</TabPanel>
				<TabPanel name={StakeTab.Escrow} activeTab={currentTab}>
					<EscrowTab />
				</TabPanel>
				<TabPanel name={StakeTab.Redemption} activeTab={currentTab}>
					<RedemptionTab />
				</TabPanel>
			</div>
		</StakingTabsContainer>
	)
}

const SelectLabelContainer = styled(LabelContainer)`
	font-size: 12px;
`

const StakingSelect = styled(Select)`
	height: 38px;
	width: 100%;
	.react-select__control,
	.react-select__menu,
	.react-select__menu-list {
		border-radius: 20px;
		background: ${(props) => props.theme.colors.selectedTheme.surfaceFill};
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
`

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)<{ active: boolean }>`
	display: ${(props) => (props.active ? 'flex' : 'none')};
	width: 24%;
	${media.lessThan('md')`
		width: unset;
	`}
`

const PeriodLabel = styled.div`
	font-size: 11px;
	line-height: 11px;
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	margin-left: 4px;
	width: 50%;
`

const StakingTabsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 30px;
	margin-bottom: 30px;

	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 10px;
		margin-bottom: 25px;
		margin-top: 0px;
	`}
`

const StakingTabsContainer = styled.div`
	${media.lessThan('md')`
		padding: 15px;
	`}
`

const TabButtons = styled.div`
	display: flex;

	& > button:not(:last-of-type) {
		margin-right: 25px;
	}

	${media.lessThan('md')`
		justify-content: space-around;
	`}
`

export default StakingTabs
