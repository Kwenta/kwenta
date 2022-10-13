import styled, { css } from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Text from 'components/Text';

export const KwentaText: React.FC<{ white?: boolean }> = ({ children, white }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<BigText $gold={!white}>{children}</BigText>
			<StyledKwentaLogo />
		</div>
	);
};

export const BigText = styled(Text.Heading)<{ $gold?: boolean }>`
	font-size: 25px;
	font-family: AkkuratMonoLLWeb-Regular;
	letter-spacing: -0.7px;
	${(props) =>
		props.$gold &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 14px;
	margin-bottom: 5px;
`;

export const Description = styled(Text.Body)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

export const OverlappingIcons = styled.div`
	display: flex;
	position: relative;

	& > div:last-child {
		position: absolute;
		z-index: 5;
		left: 12px;
	}
`;

export const GridHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 8px;
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
`;

export const ColumnInner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
`;

export const StyledSNXIcon = styled(CurrencyIcon)`
	margin: 0 9px;
`;

export const Column = styled.div`
	padding: 20px 24px 18px 24px;
	outline: 1px solid #353333;
`;

export const SplitColumn = styled.div<{ $isLast?: boolean }>`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;

	${(props) => !props.$isLast && css``}

	& > div {
		padding: 20px 24px 18px 24px;
		height: 50%;
		min-height: 95px;
	}

	& > div:last-child {
		border-top: 1px solid #353333;
	}
`;

export const InfoGridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(auto, 1fr));
	border-radius: 15px;
	border: 1px solid #353333;
	max-width: 915px;
	overflow: hidden;
	box-sizing: border-box;

	div {
		box-sizing: border-box;
	}

	& > div {
		border-left: 1px solid #353333;
		border-right: 1px solid #353333;

		&:first-child,
		&:last-child {
			border-left: none;
			border-right: none;
		}
	}
`;

export const LiquidityAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 3px;
`;
