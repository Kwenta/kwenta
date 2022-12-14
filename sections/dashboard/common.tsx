import styled from 'styled-components';

import * as Text from 'components/Text';

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 14px;

	&:not(:first-of-type) {
		margin-top: 10px;
	}
`;
