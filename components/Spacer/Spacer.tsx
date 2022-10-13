import styled from 'styled-components';

const Spacer = styled.div<{ width?: number; height?: number }>`
	width: ${({ width }) => width || 0}px;
	height: ${({ height }) => height || 0}px;
`;

export default Spacer;
