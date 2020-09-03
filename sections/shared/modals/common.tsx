import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const RowsContainer = styled.div`
	overflow: auto;
	height: 100%;
`;

export const RowsHeader = styled(FlexDivRow)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0 16px 9px 16px;
`;
