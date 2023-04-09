import styled, { css } from 'styled-components';

export const StakingCard = styled.div<{ $noPadding?: boolean }>`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	padding: 20px;
	border-radius: 20px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};

	.title {
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	.label {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	.value {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	}

	${(props) =>
		props.$noPadding &&
		css`
			padding: 0;
			overflow: hidden;
		`}
`;

export const SplitStakingCard = styled(StakingCard)`
	display: flex;
	padding: 0;
	cursor: pointer;

	& > div {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 30px 0;
		padding-left: 30px;

		&:first-of-type {
			border-right: ${(props) => props.theme.colors.selectedTheme.border};
		}
	}
`;
