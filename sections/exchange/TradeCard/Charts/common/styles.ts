import styled from 'styled-components';

export const ChartBody = styled.div<{ paddingTop?: string }>`
	padding-top: ${(props) => props.paddingTop || '0'};
	height: 100%;
	width: 100%;
`;
