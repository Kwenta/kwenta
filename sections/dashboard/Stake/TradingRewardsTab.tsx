import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import media from 'styles/media';

import { KwentaLabel, StakingCard } from './common';

const TradingRewardsTab: React.FC = () => {
	const { t } = useTranslation();

	return (
		<TradingRewardsContainer>
			<StakingCard>
				<div className="title">{t('dashboard.stake.tabs.trading-rewards.fees-paid')}</div>
				<div className="value">$2923.39</div>
			</StakingCard>
			<StakingCard>
				<div className="title">{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}</div>
				<KwentaLabel>2923.39</KwentaLabel>
			</StakingCard>
			<StakingCard>
				<div className="title">{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share')}</div>
				<div className="value">0.0002%</div>
			</StakingCard>
			<StakingCard>
				<div className="title">
					{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
				</div>
				<div className="value">4D:2H:11M</div>
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

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

export default TradingRewardsTab;
