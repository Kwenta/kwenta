import styled from 'styled-components';

export const FlexDiv = styled.div`
	display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)<{ rowGap?: string }>`
	flex-direction: column;
	row-gap: ${(props) => props.rowGap || 'initial'};
`;

export const FlexDivColCentered = styled(FlexDivCol)`
	align-items: center;
`;

export const FlexDivRow = styled(FlexDiv)<{ columnGap?: string; justifyContent?: string }>`
	justify-content: ${(props) => props.justifyContent || 'space-between'};
	column-gap: ${(props) => props.columnGap || 'initial'};
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
	align-items: center;
`;
