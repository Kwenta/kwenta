import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input/Input';

const NextPrice: React.FC = () => {
	const [volatility, setVolatility] = React.useState('');
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (volatility.includes('%')) {
			inputRef?.current?.setSelectionRange(volatility.length - 1, volatility.length - 1);
		}
	}, [volatility]);

	return (
		<NextPriceContainer>
			<p className="next-price-description">
				Next-Price orders are subject to volatility and execute at the very next on-chain price.{' '}
				<a href="https://example.com" rel="noreferrer" target="_blank">
					Learn more ↗
				</a>
			</p>
			<VolatilityTitle>
				Volatility&nbsp; —<span>&nbsp; Maximum acceptable price deviation</span>
			</VolatilityTitle>
			<VolatilityInputContainer>
				<Input
					ref={inputRef}
					value={volatility}
					onChange={(e) => {
						if (e.target.value === '' || e.target.value === '%') {
							setVolatility('');
						} else {
							setVolatility(`${e.target.value.replace('%', '')}%`);
						}
					}}
				/>
				{['.5', '1', '5'].map((v) => (
					<VolatilityButton
						key={v}
						mono
						onClick={() => {
							setVolatility(`${v}%`);
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

		a {
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}
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
