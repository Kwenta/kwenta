import styled from 'styled-components';

const Spacer = styled.div<{ width?: number; height?: number; divider?: boolean }>`
	width: ${({ width }) => width || 0}px;
	height: ${({ height }) => height || 0}px;
	background: ${(props) =>
		props.divider ? props.theme.colors.selectedTheme.newTheme.border.color : 'transparent'};
`;

export default Spacer;
