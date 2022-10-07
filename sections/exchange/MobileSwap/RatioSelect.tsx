import React from 'react';
import styled, { css } from 'styled-components';

import { useExchangeContext } from 'contexts/ExchangeContext';
import type { SwapRatio } from 'hooks/useExchange';

const RATIOS: SwapRatio[] = [25, 50, 75, 100];

const RatioSelect: React.FC = () => {
	const { quoteCurrencyBalance, ratio, onRatioChange } = useExchangeContext();

	return (
		<RatioSelectContainer>
			{RATIOS.map((v) => (
				<RatioButton
					key={`ratio-${v}`}
					$selected={ratio === v}
					onClick={() => onRatioChange(v)}
					disabled={quoteCurrencyBalance?.eq(0) || !quoteCurrencyBalance}
				>
					{`${v}%`}
				</RatioButton>
			))}
		</RatioSelectContainer>
	);
};

const RatioSelectContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 1px;
	border-radius: 10px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	height: 30px;
	overflow: hidden;
	margin-bottom: 30px;
	background-color: ${(props) => props.theme.colors.selectedTheme.tab.background.active};
`;

const RatioButton = styled.button<{ $selected: boolean }>`
	height: 100%;
	border: none;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	background-color: transparent;

	${(props) =>
		props.$selected &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.gold};
			background: ${(props) => props.theme.colors.selectedTheme.cell.gradient};
		`}

	&:first-of-type {
		border-radius: 10px 0 0 10px;
	}

	&:last-of-type {
		border-radius: 0 10px 10px 0;
	}
`;

export default RatioSelect;
