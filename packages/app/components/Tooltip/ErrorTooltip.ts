import styled, { css } from 'styled-components';

import StyledTooltip from './Tooltip';

const ErrorTooltip = styled(StyledTooltip)`
	font-size: 12px;
	${(props) => css`
		background-color: ${props.theme.colors.red};
		color: ${props.theme.colors.selectedTheme.button.text.primary};
		.tippy-arrow {
			color: ${props.theme.colors.red};
		}
	`}
`;

export default ErrorTooltip;
