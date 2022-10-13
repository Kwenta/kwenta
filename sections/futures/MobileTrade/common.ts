import styled, { css } from 'styled-components';

export const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`;

export const SectionTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.primaryGold};
	text-transform: uppercase;
	font-size: 13px;
	text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.4);
`;

export const SectionSubTitle = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export const SectionSeparator = styled.div`
	height: 1px;
	background-color: #2b2a2a;
	margin: 15px;
`;

export const Pane = styled.div<{ noPadding?: boolean }>`
	padding: 15px 15px 0;
	box-sizing: border-box;

	${(props) =>
		props.noPadding &&
		css`
			padding: 15px 0 0;
		`}

	height: 325px;
`;
