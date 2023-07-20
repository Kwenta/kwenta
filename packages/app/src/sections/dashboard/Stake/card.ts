import styled, { css } from 'styled-components'

export const StakingCard = styled.div<{ $noPadding?: boolean }>`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	padding: 25px;
	border-radius: 15px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};

	.title {
		font-size: 15px;
		color: ${(props) => props.theme.colors.selectedTheme.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.monoBold};
		font-size: 26px;
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
		margin-top: 10px;
	}

	.label {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	${(props) =>
		props.$noPadding &&
		css`
			padding: 0;
			overflow: hidden;
		`}
`

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
`
