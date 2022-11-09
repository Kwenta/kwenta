import styled from 'styled-components';

import useRewardsTimer from 'hooks/useRewardsTimer';

import {
	BigText,
	KwentaText,
	Title,
	Description,
	StyledSNXIcon,
	StyledButton,
	DollarValue,
	ColumnInner,
	InfoGridContainer,
	Column,
	SplitColumn,
	LiquidityAmount,
} from '../common';

const DEADLINE = new Date('2022-03-20T23:59:59Z');

const StakeGrid = () => {
	const timeTillDeadline = useRewardsTimer(DEADLINE);

	return (
		<>
			<StyledGridContainer>
				<Column>
					<ColumnInner>
						<div>
							<Title>Your Liquidity</Title>
							<LiquidityAmount>
								<BigText>2923.39</BigText>
								<StyledSNXIcon currencyKey="SNX" width="23px" height="23px" />
								<DollarValue>$32,284.31</DollarValue>
							</LiquidityAmount>
							<Description>Stake SNX on Optimism to earn $KWENTA.</Description>
						</div>
						<div>
							<StyledButton size="sm" variant="flat">
								Add Liquidity
							</StyledButton>
						</div>
					</ColumnInner>
				</Column>
				<SplitColumn>
					<div>
						<Title>Yield / $1K / Day</Title>
						<KwentaText>28.12</KwentaText>
					</div>
					<div>
						<Title>Your Rewards</Title>
						<KwentaText>734.72</KwentaText>
					</div>
				</SplitColumn>
				<SplitColumn>
					<div>
						<Title>Time Remaining</Title>
						<BigText>{timeTillDeadline}</BigText>
					</div>
					<div>
						<Title>Last Snapshot</Title>
						<BigText>2H Ago</BigText>
					</div>
				</SplitColumn>
			</StyledGridContainer>
		</>
	);
};

const StyledGridContainer = styled(InfoGridContainer)`
	margin-bottom: 40px;
`;

export default StakeGrid;
