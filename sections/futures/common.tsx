import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

export const Title = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: capitalize;
	padding-bottom: 15px;
`;

export const Subheader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: capitalize;
`;

export const Subtitle = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: capitalize;
`;

export const Data = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
`;

export const DataRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
`;
