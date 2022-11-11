import styled from 'styled-components';

import {
	BigText,
	Description,
	DollarValue,
	LiquidityAmount,
	StyledButton,
	StyledSNXIcon,
	Title,
} from '../common';

const LiquidityCard = () => {
	return (
		<LiquidityCardContainer>
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
				<StyledButton size="sm" variant="flat" fullWidth>
					Add Liquidity
				</StyledButton>
			</div>
		</LiquidityCardContainer>
	);
};

const LiquidityCardContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
`;

export default LiquidityCard;
