import styled, { css } from 'styled-components';

type PositionProps = {
	side: 'long' | 'short'
};

const PositionType: React.FC<PositionProps> = ({ side = 'long', children }) => {
	return (
		<StyledText $side={side}>
			{side}
		</StyledText>
	);
};

const StyledText = styled.p<{ $side: PositionProps['side']; }>`
	text-transform: uppercase;
	padding: 5px 9px;
	border-radius: 6px;

	${(props) =>
		props.$side === 'long' &&
		css`
			color: #7FD482;
			background: rgba(127, 212, 130, 0.1);
		`};

	${(props) =>
		props.$side === 'short' &&
		css`
			color: #EF6868;
			background: rgba(239, 104, 104, 0.1);
		`};
`;

export default PositionType;
