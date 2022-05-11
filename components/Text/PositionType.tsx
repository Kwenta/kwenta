import styled, { css } from 'styled-components';

type PositionProps = {
	side: 'long' | 'short';
};

const PositionType: React.FC<PositionProps> = ({ side = 'long', children }) => {
	return <StyledText $side={side}>{side}</StyledText>;
};

const StyledText = styled.p<{ $side: PositionProps['side'] }>`
	text-transform: uppercase;
	padding: 5px 9px;
	border-radius: 6px;

	${(props) =>
		props.$side === 'long' &&
		css`
			color: rgba(127, 212, 130, 0.8);
			background: rgba(127, 212, 130, 0.1);
			font-family: ${(props) => props.theme.fonts.monoBold};
			font-variant: all-small-caps;
			letter-spacing: 1.4px;
		`};

	${(props) =>
		props.$side === 'short' &&
		css`
			color: rgba(239, 104, 104, 0.8);
			background: rgba(239, 104, 104, 0.1);
			font-family: ${(props) => props.theme.fonts.monoBold};
			font-variant: all-small-caps;
			letter-spacing: -0.2px;
		`};
`;

export default PositionType;
