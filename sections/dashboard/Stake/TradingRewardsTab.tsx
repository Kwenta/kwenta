import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';

import { KwentaLabel, StakingCard } from './common';

const TradingRewardsTab: React.FC = () => {
	const { t } = useTranslation();
	const {
		epochPeriod,
		currentWeeklyReward,
		tradingRewardsScore,
		totalFeePaid,
	} = useStakingContext();
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
			<StakingCard $darkTheme={isDarkTheme}>
				<div className="title">
					{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: epochPeriod })}
				</div>
				<div className="value">${totalFeePaid.toFixed(2)}</div>
			</StakingCard>
			<StakingCard $darkTheme={isDarkTheme}>
				<div className="title">{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}</div>
				<KwentaLabel>
					{((Number(currentWeeklyReward) * tradingRewardsScore) / 100).toFixed(2)}
				</KwentaLabel>
			</StakingCard>
			<StakingCard $darkTheme={isDarkTheme}>
				<div className="title">{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share')}</div>
				<div className="value">{tradingRewardsScore.toFixed(2)}%</div>
			</StakingCard>
			<StakingCard $darkTheme={isDarkTheme}>
				<div className="title">
					{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
				</div>
				<div className="value">
					{formatTruncatedDuration(
						getNextSunday(new Date()).getTime() / 1000 - new Date().getTime() / 1000
					)}
				</div>
			</StakingCard>
		</TradingRewardsContainer>
	);
};

const TradingRewardsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	${media.lessThan('md')`
		grid-template-columns: repeat(2, 1fr);
	`}
	grid-gap: 15px;
`;

export default TradingRewardsTab;
