import styled from 'styled-components';

import * as Text from 'components/Text';

export const Title = styled(Text.Body).attrs({ variant: 'bold' })`
	font-size: 16px;
	text-align: left;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export const Copy = styled(Text.Body)`
	font-size: 16px;
	font-style: normal;
	line-height: 24px;
	text-align: left;
	color: ${(props) => props.theme.colors.silver};
`;
