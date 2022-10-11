import styled from 'styled-components';

import { FlexDivRow } from 'styles/common';

export const LabelContainer = styled(FlexDivRow)<{ noPadding?: boolean }>`
	padding: ${(props) => !props.noPadding && '16px'};
	font-size: 13px;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.regular};
	width: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	:hover {
		> svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
	> svg {
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.icon.fill};
		}
	}
`;

export default LabelContainer;
