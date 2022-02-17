import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import Button from 'components/Button';
import Text from 'components/Text';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import kwentaLogo from 'assets/svg/earn/KWENTA.svg';

export const KwentaText: React.FC<{ white?: boolean }> = ({ children, white }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<BigText $gold={!white}>{children}</BigText>
			<KwentaLogo src={kwentaLogo} />
		</div>
	);
};

export const BigText = styled(Text.Heading)<{ $gold?: boolean }>`
	font-size: 25px;
	${(props) =>
		props.$gold &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 14px;
	margin-bottom: 10px;
`;

export const Description = styled(Text.Body)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const KwentaLogo = styled(Svg)`
	margin-left: 8px;
`;

export const OverlappingIcons = styled.div`
	display: flex;
`;

export const GridHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 16px;
`;

export const StyledBody = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

export const DollarValue = styled(BigText)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
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
	padding: 18px;
	outline: 1px solid #353333;
`;

export const SplitColumn = styled.div<{ $isLast?: boolean }>`
	disply: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;

	${(props) => !props.$isLast && css``}

	& > div {
		padding: 18px 24px;
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
	box-sizing: border: box;

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
