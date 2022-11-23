import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { DropdownIndicator, IndicatorSeparator } from 'components/Select/Select';
import { TabPanel } from 'components/Tab';
import Connector from 'containers/Connector';
import { useStakingContext } from 'contexts/StakingContext';
import useIsL2 from 'hooks/useIsL2';
import { getEpochDetails } from 'queries/staking/utils';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';
import { formatShortDate, toJSTimestamp } from 'utils/formatters/date';

import EscrowTab from './EscrowTab';
import RedemptionTab from './RedemptionTab';
import StakingTab from './StakingTab';
import TradingRewardsTab from './TradingRewardsTab';

type EpochLabel = {
	period: number;
	start: number;
	end: number;
	startDate: string;
	endDate: string;
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
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const { epochPeriod, periods } = useStakingContext();

	const [period, setPeriod] = useState(epochPeriod);
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(0);
	const [currentEpochLabel, setCurrentEpochLabel] = useState(
		`Epoch 1: Oct 23, 2022 - Oct 30, 2022`
	);
	const [activeTab, setActiveTab] = useState(StakeTab.Staking);
	const handleTabSwitch = useCallback((tab: StakeTab) => () => setActiveTab(tab), []);

	const epochData = useMemo(() => {
		const epochData = periods.map((i) => {
			const { epochStart, epochEnd } = getEpochDetails(network?.id, i);
			const startDate = formatShortDate(new Date(toJSTimestamp(epochStart)));
			const endDate = formatShortDate(new Date(toJSTimestamp(epochEnd)));
			const label = `Epoch ${i}: ${startDate} - ${endDate}`;

			setPeriod(i);
			setStart(epochStart ?? 0);
			setEnd(epochEnd ?? 0);
			setCurrentEpochLabel(label);

			return {
				period: i,
				start: epochStart,
				end: epochEnd,
				startDate,
				endDate,
				label,
			};
		});
		return epochData ?? [];
	}, [network?.id, periods]);

	const formatOptionLabel = ({ label, start, end, period }: EpochLabel) => {
		return (
			<div
				onClick={() => {
					setPeriod(period);
					setStart(start ?? 0);
					setEnd(end ?? 0);
					setCurrentEpochLabel(label);
				}}
			>
				<SelectLabelContainer>{label}</SelectLabelContainer>
			</div>
		);
	};

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
						value={{
							label: currentEpochLabel,
							period,
							start,
							end,
						}}
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
					<TradingRewardsTab period={period} start={start} end={end} />
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
