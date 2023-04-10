import React, { FC, useMemo, DependencyList, useEffect, useRef, memo } from 'react';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination } from 'react-table';
import type { TableInstance, UsePaginationInstanceProps, UsePaginationState } from 'react-table';
import styled, { css } from 'styled-components';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';
import Loader from 'components/Loader';
import { Body } from 'components/Text';

import Pagination from './Pagination';
import TableBodyRow, { TableCell } from './TableBodyRow';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 100;
const MAX_TOTAL_ROWS = 9999;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
	columns?: Column[];
};

/**
 * This type adds typing for the fields returned by the usePagination hook when used in
 * conjunction with useTable, to compensate for deficiencies of @types/react-table.
 * This should be fixed in react-table v8-- see: https://github.com/TanStack/table/issues/3064
 */
type TableWithPagination<T extends object> = TableInstance<T> &
	UsePaginationInstanceProps<T> & {
		state: UsePaginationState<T>;
	};

export function compareNumericString(rowA: Row<any>, rowB: Row<any>, id: string, desc: boolean) {
	let a = parseFloat(rowA.values[id]);
	let b = parseFloat(rowB.values[id]);
	if (isNaN(a)) {
		// Blanks and non-numeric strings to bottom
		a = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	}
	if (isNaN(b)) {
		b = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	}
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}

type TableProps = {
	palette?: TablePalette;
	data: object[];
	columns: ColumnWithSorting<object>[];
	columnsDeps?: DependencyList;
	options?: any;
	onTableRowClick?: (row: Row<any>) => void;
	className?: string;
	isLoading?: boolean;
	noResultsMessage?: React.ReactNode;
	showPagination?: boolean;
	pageSize?: number | null;
	hiddenColumns?: string[];
	hideHeaders?: boolean;
	highlightRowsOnHover?: boolean;
	sortBy?: object[];
	showShortList?: boolean;
	lastRef?: any;
	compactPagination?: boolean;
	rowStyle?: Record<string, any>;
	rounded?: boolean;
};

export const Table: FC<TableProps> = memo(
	({
		columns = [],
		columnsDeps = [],
		data = [],
		options = {},
		noResultsMessage = null,
		onTableRowClick = undefined,
		palette = 'primary',
		isLoading = false,
		className,
		showPagination = false,
		pageSize = null,
		hiddenColumns = [],
		hideHeaders,
		highlightRowsOnHover,
		showShortList,
		sortBy = [],
		lastRef = null,
		compactPagination = false,
		rowStyle = {},
		rounded = true,
	}) => {
		const memoizedColumns = useMemo(
			() => columns,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			columnsDeps
		);

		const {
			getTableProps,
			getTableBodyProps,
			headerGroups,
			page,
			prepareRow,
			canPreviousPage,
			canNextPage,
			pageCount,
			gotoPage,
			nextPage,
			previousPage,
			state: { pageIndex },
			setHiddenColumns,
		} = useTable(
			{
				columns: memoizedColumns,
				data,
				initialState: {
					pageSize: showPagination
						? pageSize
							? pageSize
							: MAX_PAGE_ROWS
						: showShortList
						? pageSize ?? 5
						: MAX_TOTAL_ROWS,
					hiddenColumns: hiddenColumns,
					sortBy: sortBy,
				},
				autoResetPage: false,
				autoResetSortBy: false,
				...options,
			},
			useSortBy,
			usePagination,
			useFlexLayout
		) as TableWithPagination<object>;

		useEffect(() => {
			setHiddenColumns(hiddenColumns);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// reset to the first page
		// this fires when filters are applied that change the data
		// if a filter is applied that reduces the data size below max pages for that filter, reset to the first page
		useEffect(() => {
			if (pageIndex > pageCount) {
				gotoPage(0);
			}
		}, [pageIndex, pageCount, gotoPage]);

		const defaultRef = useRef(null);

		return (
			<>
				<TableContainer>
					<ReactTable
						{...getTableProps()}
						palette={palette}
						$rounded={rounded}
						className={className}
					>
						{headerGroups.map((headerGroup) => (
							<div className="table-row" style={{ display: 'flex' }}>
								{headerGroup.headers.map((column: any) => (
									<TableCellHead
										hideHeaders={hideHeaders}
										{...column.getHeaderProps(
											column.sortable ? column.getSortByToggleProps() : undefined
										)}
									>
										{column.render('Header')}
										{column.sortable && (
											<SortIconContainer>
												{column.isSorted ? (
													column.isSortedDesc ? (
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
								))}
							</div>
						))}
						{isLoading ? (
							<Loader />
						) : !!noResultsMessage && !isLoading && data.length === 0 ? (
							noResultsMessage
						) : page.length > 0 ? (
							<TableBody className="table-body" {...getTableBodyProps()}>
								{page.map((row: Row, idx: number) => {
									prepareRow(row);
									const props = row.getRowProps();
									const localRef = lastRef && idx === page.length - 1 ? lastRef : defaultRef;
									const handleClick = onTableRowClick ? () => onTableRowClick(row) : undefined;
									return (
										<TableBodyRow
											rowStyle={rowStyle}
											localRef={localRef}
											highlightRowsOnHover={highlightRowsOnHover}
											row={row}
											onClick={handleClick}
											{...props}
										/>
									);
								})}
							</TableBody>
						) : null}
					</ReactTable>
				</TableContainer>
				{showPagination && !showShortList && data.length > (pageSize ?? MAX_PAGE_ROWS) ? (
					<Pagination
						compact={compactPagination}
						pageIndex={pageIndex}
						pageCount={pageCount}
						canNextPage={canNextPage}
						canPreviousPage={canPreviousPage}
						setPage={gotoPage}
						previousPage={previousPage}
						nextPage={nextPage}
					/>
				) : undefined}
			</>
		);
	}
);

const TableContainer = styled.div`
	overflow-x: auto;
	height: 100%;
`;

const TableBody = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
`;

export const TableCellHead = styled(TableCell)<{ hideHeaders: boolean }>`
	user-select: none;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 18px;
	}
	${(props) => (props.hideHeaders ? `display: none` : '')}
`;

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
`;

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const ReactTable = styled.div<{ palette: TablePalette; $rounded?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: auto;
	position: relative;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	${(props) =>
		props.$rounded
			? css`
					border-radius: 10px;
			  `
			: css`
					border-left: none;
					border-right: none;
			  `};

	${(props) =>
		props.palette === 'primary' &&
		css`
			${TableBody} {
				max-height: calc(100% - ${CARD_HEIGHT});
			}
			${TableCell} {
				color: ${(props) => props.theme.colors.selectedTheme.text.value};
				font-size: 13px;
				height: ${CARD_HEIGHT};
				font-family: ${(props) => props.theme.fonts.mono};
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.selectedTheme.text.label};
				font-family: ${(props) => props.theme.fonts.regular};
				border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
			}
		`}
`;

const StyledSortDownIcon = styled(SortDownIcon)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledSortUpIcon = styled(SortUpIcon)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export const TableHeader = styled(Body)<{ $small?: boolean }>`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};

	${(props) =>
		props.$small &&
		css`
			font-size: 10px;
		`}
`;

export default Table;
