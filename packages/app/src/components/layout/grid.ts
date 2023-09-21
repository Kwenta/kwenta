import styled, { css } from 'styled-components'

import media from 'styles/media'

export const GridDiv = styled.div`
	display: grid;
`

export const GridDivCentered = styled(GridDiv)`
	align-items: center;
`

export const GridDivCenteredRow = styled(GridDivCentered)`
	grid-auto-flow: row;
`

export const GridDivCenteredCol = styled(GridDivCentered)`
	grid-auto-flow: column;
`

export const SplitContainer = styled.div`
	display: grid;
	grid-gap: 15px;
	margin-top: 10px;

	${media.greaterThan('lg')`
		grid-template-columns: 1fr 1fr;
	`}

	${media.lessThan('lg')`
		display: flex;
		flex-direction: column-reverse;
		row-gap: 25px;
	`}
`

export const ContainerRowMixin = css`
	display: inline-grid;
	grid-gap: 1px;
`
