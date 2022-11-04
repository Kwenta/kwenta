import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { truncateNumbers } from 'utils/formatters/number';

import { KwentaLabel, StakingCard } from './common';

const TradingRewardsTab: React.FC = () => {
	const { t } = useTranslation();
	const {
		epochPeriod,
		currentWeeklyReward,
		tradingRewardsRatio,
		feePaid,
		claimEpochConfig,
		claimError,
	} = useStakingContext();

	const { write: claim } = useContractWrite(claimEpochConfig);

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const getNextSunday = (date: Date) => {
		const nextSunday = new Date();
		nextSunday.setDate(date.getDate() + (7 - date.getDay()));
		nextSunday.setHours(0, 0, 0, 0);
		return nextSunday;
	};

	return (
		<TradingRewardsContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-epoch', {
								EpochPeriod: epochPeriod,
							})}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
				</CardGrid>
				<StyledFlexDivRow>
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={tradingRewardsRatio === 0 || claimError}
						onClick={() => claim?.()}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim-epoch', { EpochPeriod: epochPeriod })}
					</Button>
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={tradingRewardsRatio === 0 || claimError}
						onClick={() => claim?.()}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim-all')}
					</Button>
				</StyledFlexDivRow>
			</CardGridContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: epochPeriod })}
						</div>
						<div className="value">{truncateNumbers(feePaid ?? 0, 4)}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share')}
						</div>
						<div className="value">{truncateNumbers(tradingRewardsRatio * 100, 4)}%</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
						</div>
						<div className="value">
							{formatTruncatedDuration(
								getNextSunday(new Date()).getTime() / 1000 - new Date().getTime() / 1000
							)}
						</div>
					</div>
				</CardGrid>
			</CardGridContainer>
		</TradingRewardsContainer>
	);
};

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 15px;
`;

const CardGridContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;
	& > div {
		margin-bottom: 20px;
	}

	.value {
		margin-top: 5px;
	}
`;

const TradingRewardsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	${media.lessThan('md')`
		grid-template-columns: repeat(2, 1fr);
	`}
	grid-gap: 15px;
`;

export default TradingRewardsTab;
