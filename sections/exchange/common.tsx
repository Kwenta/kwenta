import styled from 'styled-components';

import { FlexDivRowCentered } from 'styles/common';

export const RoundedContainer = styled(FlexDivRowCentered)`
	border-radius: 1000px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	max-width: 680px;
	margin: 0 auto;
`;
