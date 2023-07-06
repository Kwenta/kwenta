import styled from 'styled-components'

import { GridDivCenteredCol } from 'components/layout/grid'

import CustomizePagination from './CustomizePagination'
import Pagination from './Pagination'

type PaginationAreaProps = {
	customizePagination: boolean
	compact: boolean
	pageIndex: number
	pageCount: number
	canNextPage: boolean
	canPreviousPage: boolean
	gotoPage: (page: number) => void
	previousPage: () => void
	nextPage: () => void
	children?: React.ReactNode
}

const PaginationArea: React.FC<PaginationAreaProps> = ({
	customizePagination,
	compact = false,
	pageIndex,
	pageCount,
	canNextPage,
	canPreviousPage,
	gotoPage,
	previousPage,
	nextPage,
	children,
}) => {
	if (customizePagination) {
		return (
			<PaginationContainer>
				<CustomizePagination
					compact={compact}
					pageIndex={pageIndex}
					pageCount={pageCount}
					canNextPage={canNextPage}
					canPreviousPage={canPreviousPage}
					setPage={gotoPage}
					previousPage={previousPage}
					nextPage={nextPage}
				/>
				{children}
			</PaginationContainer>
		)
	}

	return (
		<>
			<Pagination
				compact={compact}
				pageIndex={pageIndex}
				pageCount={pageCount}
				canNextPage={canNextPage}
				canPreviousPage={canPreviousPage}
				setPage={gotoPage}
				previousPage={previousPage}
				nextPage={nextPage}
			/>
			{children}
		</>
	)
}

const PaginationContainer = styled(GridDivCenteredCol)`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	padding: 20px 25px;
	border-radius: 100px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	margin-top: 15px;
`

export default PaginationArea
