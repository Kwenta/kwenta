import styled from 'styled-components';

import * as Text from 'components/Text';

export const Description = styled(Text.Body)`
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin: 8px 0;
`;

export const Heading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 21px;
	margin-bottom: 4px;
	text-transform: uppercase;
	font-variant: all-small-caps;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;
