import styled from 'styled-components';

import { FlexDivRow } from 'components/layout/flex';

export const LabelContainer = styled(FlexDivRow)<{ noPadding?: boolean; external?: boolean }>`
	padding: ${(props) => !props.noPadding && '16px'};
	font-size: 13px;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.regular};
	width: 100%;
	color: ${(props) =>
		props.external
			? props.theme.colors.selectedTheme.button.yellow.text
			: props.theme.colors.selectedTheme.button.text.primary};

	:hover {
		> svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
	> svg {
		path {
			fill: ${(props) =>
				props.external
					? props.theme.colors.selectedTheme.white
					: props.theme.colors.selectedTheme.icon.fill};
		}
	}
`;

export default LabelContainer;
