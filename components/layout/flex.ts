import styled from 'styled-components';

export const FlexDiv = styled.div`
	display: flex;
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

export const FlexDivRow = styled(FlexDiv)<{ columnGap?: string }>`
	justify-content: space-between;
	column-gap: ${(props) => props.columnGap || 'initial'};
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
	align-items: center;
`;
