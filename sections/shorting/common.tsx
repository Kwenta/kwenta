import { onlyCapitalizeInEnglish } from 'i18n';
import styled from 'styled-components';

export const Title = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: ${onlyCapitalizeInEnglish};
	padding-bottom: 15px;
`;
