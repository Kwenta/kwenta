import React, { FC, useMemo, DependencyList, useEffect, useRef } from 'react';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination } from 'react-table';
import styled, { css } from 'styled-components';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';
import Spinner from 'assets/svg/app/loader.svg';
import { GridDivCenteredRow } from 'styles/common';

import Pagination from './Pagination';
import TableBodyRow, { TableCell } from './TableBodyRow';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 100;
const MAX_TOTAL_ROWS = 1000;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
	columns?: Column[];
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
};

export const Table: FC<TableProps> = ({
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
}) => {
	const memoizedColumns = useMemo(
		() => columns,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		columnsDeps
	);

	// TODO: How do I tell Typescript about the usePagination props?
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		// @ts-ignore
		page,
		prepareRow,
		// @ts-ignore
		canPreviousPage,
		// @ts-ignore
		canNextPage,
		// @ts-ignore
		pageCount,
		// @ts-ignore
		gotoPage,
		// @ts-ignore
		nextPage,
		// @ts-ignore
		previousPage,
		// @ts-ignore
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
	);

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
				<ReactTable {...getTableProps()} palette={palette} className={className}>
					{headerGroups.map((headerGroup) => (
						<TableRow className="table-row" {...headerGroup.getHeaderGroupProps()}>
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
						</TableRow>
					))}
					{isLoading ? (
						<StyledSpinner />
					) : (
						page.length > 0 && (
							<TableBody className="table-body" {...getTableBodyProps()}>
								{page.map((row: Row, idx: number) => {
									prepareRow(row);
									const props = row.getRowProps();
									const localRef = lastRef && idx === page.length - 1 ? lastRef : defaultRef;
									const handleClick = onTableRowClick ? () => onTableRowClick(row) : undefined;
									return (
										<TableBodyRow
											localRef={localRef}
											highlightRowsOnHover={highlightRowsOnHover}
											row={row}
											onClick={handleClick}
											{...props}
										/>
									);
								})}
							</TableBody>
						)
					)}
					{!!noResultsMessage && !isLoading && data.length === 0 && noResultsMessage}
				</ReactTable>
			</TableContainer>
			{!showShortList && data.length > (pageSize ?? MAX_PAGE_ROWS) ? (
				<Pagination
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
};

const TableContainer = styled.div`
	overflow-x: auto;
`;

const StyledSpinner = styled(Spinner)`
	display: block;
	margin: 30px auto;
`;

export const TableRow = styled.div``;

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

export const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 40px;
	text-align: center;
	justify-content: center;
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
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

const ReactTable = styled.div<{ palette: TablePalette }>`
	width: 100%;
	height: 100%;
	overflow: auto;
	position: relative;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;

	${(props) =>
		props.palette === 'primary' &&
		css`
			${TableBody} {
				max-height: calc(100% - ${CARD_HEIGHT});
			}
			${TableCell} {
				color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
				font-size: 12px;
				height: ${CARD_HEIGHT};
				font-family: ${(props) => props.theme.fonts.mono};
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.selectedTheme.gray};
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

export default Table;
