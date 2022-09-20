import styled from 'styled-components';

export const StakingCard = styled.div`
	background: linear-gradient(0deg, #181818, #181818),
		linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
	padding: 20px;
	border-radius: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};

	.title {
		font-size: 15px;
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.monoBold};
		font-size: 26px;
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
		margin-top: 10px;
	}
`;

export const SplitStakingCard = styled(StakingCard)`
	display: flex;
	padding: 0;

	& > div {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		padding: 30px 0;

		&:first-of-type {
			border-right: ${(props) => props.theme.colors.selectedTheme.border};
		}
	}
`;
