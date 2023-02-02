import styled, { css } from 'styled-components';

import { PositionSide } from 'sdk/types/futures';

type PositionProps = {
	side: PositionSide;
	mobile?: boolean;
};

const PositionType: React.FC<PositionProps> = ({ side = PositionSide.LONG, mobile = false }) => {
	return mobile ? (
		<MobileStyledText side={side}>{side}</MobileStyledText>
	) : (
		<StyledText side={side}>{side}</StyledText>
	);
};

const StyledText = styled.p<{ side: PositionSide }>`
	text-transform: uppercase;
	padding: 5px 9px;
	border-radius: 6px;
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-variant: all-small-caps;

	${(props) =>
		props.side === PositionSide.LONG
			? css`
					color: ${(props) => props.theme.colors.common.primaryGreen};
					background: rgba(127, 212, 130, 0.1);
					letter-spacing: 1.4px;
			  `
			: css`
					color: ${(props) => props.theme.colors.common.primaryRed};
					background: rgba(239, 104, 104, 0.1);
					letter-spacing: -0.2px;
			  `};
	};
`;

const MobileStyledText = styled.p<{ side: PositionSide }>`
	margin: 0;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) =>
		props.side === PositionSide.LONG
			? props.theme.colors.common.primaryGreen
			: props.theme.colors.common.primaryRed};
`;

export default PositionType;
