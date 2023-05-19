import styled from 'styled-components';

export const FlexDiv = styled.div<{ columnGap?: string }>`
	display: flex;
	column-gap: ${(props) => props.columnGap || 'initial'};
`;

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)`
	flex-direction: column;
`;

export const FlexDivColCentered = styled(FlexDivCol)`
	align-items: center;
`;

export const FlexDivRow = styled(FlexDiv)<{ justifyContent?: string }>`
	justify-content: ${(props) => props.justifyContent || 'space-between'};
`;

export const FlexDivRowCentered = styled(FlexDivRow)<{ alignItems?: string }>`
	align-items: ${(props) => props.alignItems || 'center'};
`;
