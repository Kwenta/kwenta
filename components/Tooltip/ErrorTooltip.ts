import styled from 'styled-components';

import StyledTooltip from './Tooltip';

const ErrorTooltip = styled(StyledTooltip)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export default ErrorTooltip;
