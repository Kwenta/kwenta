import styled from 'styled-components';

import Input from './Input';

export const NumericInput = styled(Input).attrs({ type: 'number' })`
	font-family: ${(props) => props.theme.fonts.mono};
	text-overflow: ellipsis;
`;

export default NumericInput;
