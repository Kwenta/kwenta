import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';

const NextPrice: React.FC = () => {
	const [volatility, setVolatility] = React.useState('');

	return (
		<NextPriceContainer>
			<p className="next-price-description">
				Next-Price orders are subject to volatility and execute at the very next on-chain price.
				Learn more ↗
			</p>
			<VolatilityTitle>
				Volatility&nbsp; —<span>&nbsp; Maximum acceptable price deviation</span>
			</VolatilityTitle>
			<VolatilityInputContainer>
				<NumericInput
					value={volatility}
					onChange={(_, value) => {
						setVolatility(value);
					}}
				/>
				{['.5', '1', '5'].map((v) => (
					<VolatilityButton
						key={v}
						mono
						onClick={() => {
							setVolatility(v);
						}}
					>
						{v}%
					</VolatilityButton>
				))}
			</VolatilityInputContainer>
		</NextPriceContainer>
	);
};

const NextPriceContainer = styled.div`
	margin-bottom: 16px;

	.next-price-description {
		color: ${(props) => props.theme.colors.common.secondaryGray};
		margin: 0 8px;
	}
`;

const VolatilityTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 12px;
	margin-bottom: 8px;
	margin-left: 8px;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const VolatilityInputContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 43px 43px 43px;
	grid-gap: 15px;
	align-items: center;
`;

const VolatilityButton = styled(Button)`
	padding: 0;
	font-weight: 700;
	font-size: 13px;
`;

export default NextPrice;
