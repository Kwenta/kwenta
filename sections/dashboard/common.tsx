import styled from 'styled-components';

import { fonts } from 'styles/theme/fonts';

export const CardTitle = styled.div`
	${fonts.body.boldMedium}
	color: ${(props) => props.theme.colors.white};
`;

export const ConvertContainer = styled.div`
	max-width: 720px;
	margin: 0 auto;
	width: 100%;
`;
