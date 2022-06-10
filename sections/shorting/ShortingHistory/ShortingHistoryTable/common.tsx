import styled from 'styled-components';

export const StyledCurrencyKey = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-left: 10px;
`;

export const StyledPrice = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.silver};
`;

export const PriceChangeText = styled.span<{ isPositive: boolean }>`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
`;
