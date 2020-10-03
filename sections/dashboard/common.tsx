import styled from 'styled-components';

export const CardTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
`;

export const ConvertContainer = styled.div`
	max-width: 1000px;
	margin: 0 auto;
	width: 100%;
`;
