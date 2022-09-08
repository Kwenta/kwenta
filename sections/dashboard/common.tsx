import styled from 'styled-components';

import Text from 'components/Text';

export const CardTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 14px;

	&:not(:first-of-type) {
		margin-top: 10px;
	}
`;
