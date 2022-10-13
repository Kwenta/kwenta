import styled from 'styled-components';

export const ChartBody = styled.div<{ paddingTop?: string }>`
	padding-top: ${(props) => props.paddingTop || '0'};
	height: 45vh;
	min-height: 450px;
	max-height: 650px;
`;
