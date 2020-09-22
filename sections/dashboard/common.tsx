import styled from 'styled-components';

import { fonts } from 'styles/theme/fonts';

export const Center = styled.div`
	margin: 0 auto;
	margin-bottom: 78px;
`;

export const CardTitle = styled.div`
	${fonts.body['bold-medium']}
	color: ${(props) => props.theme.colors.white};
`;
