import styled from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import Button from 'components/Button';
import Text from 'components/Text';
import media from 'styles/media';

export const BigText: React.FC<{ hasKwentaLogo?: boolean }> = ({
	children,
	hasKwentaLogo,
	...rest
}) => (
	<div style={{ display: 'flex', alignItems: 'center' }}>
		<BigTextRaw {...rest}>{children}</BigTextRaw>
		{hasKwentaLogo && <StyledKwentaLogo />}
	</div>
);

export const BigTextRaw = styled(Text.Heading)<{ $yellow?: boolean }>`
	font-size: 25px;
	font-family: AkkuratMonoLLWeb-Regular;
	letter-spacing: -0.7px;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 14px;
	margin-bottom: 5px;
`;

export const Description = styled(Text.Body)`
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin: 8px 0;
`;

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

export const StyledBody = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

export const DollarValue = styled(BigText)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-left: 8px;
`;

export const SplitColumn = styled.div`
	${media.greaterThan('mdUp')`
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;

		& > div {
			padding: 20px 24px 18px 24px;
			height: 50%;
			min-height: 95px;
		}

		& > div:last-child {
			border-top: 1px solid #353333;
		}
	`}
`;

export const GridContainer = styled.div`
	display: flex;

	${media.lessThan('mdUp')`
		flex-direction: column;
	`}

	${media.greaterThan('mdUp')`
		border-radius: 15px;
		border: 1px solid #353333;
		overflow: hidden;

		& > div {
			box-sizing: border-box;
			border-left: 1px solid #353333;
			border-right: 1px solid #353333;

			&:first-child,
			&:last-child {
				border-left: none;
				border-right: none;
			}
		}
	`}
`;

export const LiquidityAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 3px;
`;

export const Heading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 21px;
	margin-bottom: 4px;
	text-transform: uppercase;
	font-variant: all-small-caps;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;
