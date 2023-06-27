import styled from 'styled-components'

export const FlexDiv = styled.div<{ columnGap?: string }>`
	display: flex;
	column-gap: ${(props) => props.columnGap || 'initial'};
`

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`

export const FlexDivCol = styled(FlexDiv)<{ rowGap?: string; alignItems?: string }>`
	flex-direction: column;
	row-gap: ${(props) => props.rowGap || 'initial'};
	align-items: ${(props) => props.alignItems || 'initial'};
`

export const FlexDivColCentered = styled(FlexDivCol)`
	align-items: center;
`

export const FlexDivRow = styled(FlexDiv)<{ columnGap?: string; justifyContent?: string }>`
	justify-content: ${(props) => props.justifyContent || 'space-between'};
	column-gap: ${(props) => props.columnGap || 'initial'};
`

export const FlexDivRowCentered = styled(FlexDivRow)<{ alignItems?: string }>`
	align-items: ${(props) => props.alignItems || 'center'};
`
