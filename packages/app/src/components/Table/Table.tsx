import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	PaginationState,
	getPaginationRowModel,
	getSortedRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, Row, SortingState, VisibilityState } from '@tanstack/react-table'
import React, { DependencyList, FC, useCallback, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { genericMemo } from 'types/helpers'

import SortDownIcon from 'assets/svg/app/caret-down.svg'
import SortUpIcon from 'assets/svg/app/caret-up.svg'
import { FlexDiv } from 'components/layout/flex'
import Loader from 'components/Loader'
import { Body } from 'components/Text'
import media from 'styles/media'

import Pagination, { PaginationProps } from './Pagination'
import TableBodyRow, { TableCell } from './TableBodyRow'

const CARD_HEIGHT_MD = '50px'
const CARD_HEIGHT_LG = '40px'
const MAX_PAGE_ROWS = 100
const MAX_TOTAL_ROWS = 9999
const SHORT_PAGE_SIZE = 5

export function compareNumericString(rowA: Row<any>, rowB: Row<object>, id: string, desc: boolean) {
	let a = parseFloat(rowA.getValue(id))
	let b = parseFloat(rowB.getValue(id))
	if (isNaN(a)) {
		// Blanks and non-numeric strings to bottom
		a = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
	}
	if (isNaN(b)) {
		b = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
	}
	if (a > b) return 1
	if (a < b) return -1
	return 0
}

function calculatePageSize(
	showPagination: boolean,
	showShortList: boolean | undefined,
	pageSize: number | undefined
): number {
	if (showPagination) {
		return pageSize ? pageSize : MAX_PAGE_ROWS
	}
	return showShortList ? pageSize ?? SHORT_PAGE_SIZE : MAX_TOTAL_ROWS
}

type TableProps<T> = {
	data: T[]
	columns: ColumnDef<T, any>[]
	onTableRowClick?: (row: Row<T>) => void
	className?: string
	isLoading?: boolean
	noResultsMessage?: React.ReactNode
	showPagination?: boolean
	pageSize?: number
	hiddenColumns?: string[]
	hideHeaders?: boolean
	highlightRowsOnHover?: boolean
	sortBy?: SortingState
	showShortList?: boolean
	lastRef?: any
	compactPagination?: boolean
	rounded?: boolean
	noBottom?: boolean
	columnVisibility?: VisibilityState
	columnsDeps?: DependencyList
	paginationExtra?: React.ReactNode
	CustomPagination?: FC<PaginationProps>
}

const Table = <T,>({
	columns = [],
	data = [],
	noResultsMessage = null,
	onTableRowClick = undefined,
	isLoading = false,
	className,
	showPagination = false,
	pageSize = undefined,
	hideHeaders,
	highlightRowsOnHover,
	showShortList,
	sortBy = [],
	lastRef = null,
	compactPagination = false,
	rounded = true,
	noBottom = false,
	columnVisibility,
	columnsDeps = [],
	paginationExtra,
	CustomPagination,
}: TableProps<T>) => {
	const [sorting, setSorting] = useState<SortingState>(sortBy)
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: calculatePageSize(showPagination, showShortList, pageSize),
	})

	// FIXME: It is probably better to memoize columns per-component.
	const memoizedColumns = useMemo(
		() => columns,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		columnsDeps
	)

	const table = useReactTable<T>({
		columns: memoizedColumns,
		data,
		enableHiding: true,
		state: { sorting, columnVisibility, pagination },
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	const defaultRef = useRef(null)

	const shouldShowPagination = useMemo(
		() => showPagination && !showShortList && data.length > table.getState().pagination.pageSize,
		[data.length, showPagination, showShortList, table]
	)

	const handleRowClick = useCallback(
		(row: Row<T>) => () => {
			onTableRowClick?.(row)
		},
		[onTableRowClick]
	)

	return (
		<>
			<TableContainer>
				<ReactTable $rounded={rounded} $noBottom={noBottom} className={className}>
					{table.getHeaderGroups().map((headerGroup) => (
						<FlexDiv key={headerGroup.id} className="table-row">
							{headerGroup.headers.map((header) => {
								return (
									<TableCellHead
										key={header.id}
										hideHeaders={!!hideHeaders}
										style={{ width: header.getSize(), flex: header.getSize() }}
										onClick={header.column.getToggleSortingHandler()}
										$canSort={header.column.getCanSort()}
									>
										{flexRender(header.column.columnDef.header, header.getContext())}
										{header.column.getCanSort() && (
											<SortIconContainer>
												{header.column.getIsSorted() ? (
													header.column.getIsSorted() === 'desc' ? (
														<StyledSortDownIcon />
													) : (
														<StyledSortUpIcon />
													)
												) : (
													<>
														<StyledSortUpIcon />
														<StyledSortDownIcon />
													</>
												)}
											</SortIconContainer>
										)}
									</TableCellHead>
								)
							})}
						</FlexDiv>
					))}
					{isLoading ? (
						<Loader />
					) : !!noResultsMessage && data.length === 0 ? (
						noResultsMessage
					) : (
						<TableBody className="table-body">
							{table.getRowModel().rows.map((row, idx) => {
								const localRef =
									lastRef && idx === table.getState().pagination.pageSize - 1 ? lastRef : defaultRef
								return (
									<TableBodyRow
										key={row.id}
										localRef={localRef}
										highlightRowsOnHover={highlightRowsOnHover}
										row={row}
										onClick={handleRowClick(row)}
									/>
								)
							})}
						</TableBody>
					)}
					{(shouldShowPagination || paginationExtra) && !CustomPagination ? (
						<Pagination
							compact={compactPagination}
							pageIndex={table.getState().pagination.pageIndex}
							pageCount={table.getPageCount()}
							canNextPage={table.getCanNextPage()}
							canPreviousPage={table.getCanPreviousPage()}
							setPage={table.setPageIndex}
							previousPage={table.previousPage}
							nextPage={table.nextPage}
							extra={paginationExtra}
						/>
					) : undefined}
				</ReactTable>
			</TableContainer>
			{CustomPagination && (
				<CustomPagination
					compact={compactPagination}
					pageIndex={table.getState().pagination.pageIndex}
					pageCount={table.getPageCount()}
					canNextPage={table.getCanNextPage()}
					canPreviousPage={table.getCanPreviousPage()}
					setPage={table.setPageIndex}
					previousPage={table.previousPage}
					nextPage={table.nextPage}
					extra={paginationExtra}
				/>
			)}
		</>
	)
}

const TableContainer = styled.div`
	overflow-x: auto;
	height: 100%;
`

export const TableBody = styled.div`
	overflow-y: auto;
	overflow-x: visible;
`

export const TableCellHead = styled(TableCell)<{ hideHeaders: boolean; $canSort: boolean }>`
	user-select: none;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 18px;
	}
	${(props) => (props.hideHeaders ? `display: none` : '')}
	${(props) =>
		props.$canSort &&
		css`
			cursor: pointer;
		`}
`

export const TableNoResults = styled.div`
	height: 52px;
	height: 100%;
	padding: 16px;
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
	div {
		text-decoration: underline;
		cursor: pointer;
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`

const ReactTable = styled.div<{ $rounded?: boolean; $noBottom?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	overflow: auto;
	position: relative;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	${(props) =>
		props.$noBottom &&
		css`
			border-bottom-width: 0;
		`};

	${(props) =>
		props.$rounded
			? css`
					border-radius: 10px;
			  `
			: css`
					border-left: none;
					border-right: none;
			  `};

	${TableBody} {
		max-height: calc(100% - ${CARD_HEIGHT_LG});
		${media.lessThan('xxl')`
			max-height: calc(100% - ${CARD_HEIGHT_MD});
		`}
	}

	${TableCell} {
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
		font-size: 13px;
		height: ${CARD_HEIGHT_LG};
		${media.lessThan('xxl')`
			height: ${CARD_HEIGHT_MD};
		`}
		font-family: ${(props) => props.theme.fonts.mono};
	}

	${TableCellHead} {
		color: ${(props) => props.theme.colors.selectedTheme.text.label};
		font-family: ${(props) => props.theme.fonts.regular};
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
		height: 34px;
	}
`

const StyledSortDownIcon = styled(SortDownIcon)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const StyledSortUpIcon = styled(SortUpIcon)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

export const TableHeader = styled(Body)<{ $small?: boolean }>`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};

	${(props) =>
		props.$small &&
		css`
			font-size: 10px;
		`}
`

export default genericMemo(Table)
