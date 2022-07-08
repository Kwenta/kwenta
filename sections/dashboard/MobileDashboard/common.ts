import styled from 'styled-components';

export const HeaderContainer = styled.div`
	padding: 15px;
`;

export const MarketStatsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-gap: 8px;
`;

export const MarketStat = styled.div`
	border-radius: 8px;
	box-sizing: border-box;
	padding: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};

	.title {
		font-size: 12px;
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		margin-bottom: 4px;
	}

	.value {
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.bold};
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
`;
