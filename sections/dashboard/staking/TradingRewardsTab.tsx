import styled from 'styled-components';

import { StakingCard } from './common';

const TradingRewardsTab: React.FC = () => {
	return (
		<TradingRewardsContainer>
			<StakingCard>
				<div className="title">Fees Paid: Epoch 4</div>
				<div className="value">$2923.39</div>
			</StakingCard>
			<StakingCard>
				<div className="title">Estimated Rewards</div>
				<div className="value">2923.39</div>
			</StakingCard>
			<StakingCard>
				<div className="title">Estimated Fee Share</div>
				<div className="value">0.0002%</div>
			</StakingCard>
			<StakingCard>
				<div className="title">Trading Activity Reset</div>
				<div className="value">4D:2H:11M</div>
			</StakingCard>
		</TradingRewardsContainer>
	);
};

const TradingRewardsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: -15px 0 0 -15px;
	width: calc(100% + 15px);

	& > div {
		flex: 1;
		min-width: 220px;
		max-width: 100%;
		margin: 15px 0 0 15px;
	}
`;

export default TradingRewardsTab;
