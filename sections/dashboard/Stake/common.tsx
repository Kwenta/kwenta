import styled, { css } from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';

export const KwentaLabel: React.FC = ({ children }) => {
	return (
		<div className="value">
			{children}
			<StyledKwentaLogo />
		</div>
	);
};

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

export const StakingCard = styled.div<{ $noPadding?: boolean }>`
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
