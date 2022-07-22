import React, { FC, useMemo, DependencyList, useEffect } from 'react';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination, Cell } from 'react-table';
import styled, { css } from 'styled-components';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';
import Spinner from 'assets/svg/app/loader.svg';
import { FlexDivCentered } from 'styles/common';

import Pagination from './Pagination';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 100;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
	columns?: Column[];
};

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
					: 15,
				hiddenColumns: hiddenColumns,
				sortBy: sortBy,
			},
			autoResetPage: false,
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
								{page.map((row: Row) => {
									prepareRow(row);

									return (
										<TableBodyRow
											className="table-body-row"
											{...row.getRowProps()}
											onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
											$highlightRowsOnHover={highlightRowsOnHover}
										>
											{row.cells.map((cell: Cell) => (
												<TableCell className="table-body-cell" {...cell.getCellProps()}>
													{cell.render('Cell')}
												</TableCell>
											))}
										</TableBodyRow>
									);
								})}
							</TableBody>
						)
					)}
					{!!noResultsMessage && !isLoading && data.length === 0 && noResultsMessage}
				</ReactTable>
			</TableContainer>
			{!showShortList && showPagination && data.length > (pageSize ? pageSize : MAX_PAGE_ROWS) ? (
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

const TableBodyRow = styled.div<{ $highlightRowsOnHover?: boolean }>`
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 6px 0;

	&:last-child {
		border: none;
	}

	&:nth-child(odd) {
		background-color: ${(props) => props.theme.colors.selectedTheme.table.fill};
	}

	${(props) =>
		props.$highlightRowsOnHover &&
		css`
			&:hover {
				background-color: ${(props) => props.theme.colors.selectedTheme.table.hover};
			}
		`}
`;

const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	&:first-child {
		padding-left: 14px;
	}
	&:last-child {
		padding-right: 14px;
	}
`;

const TableCellHead = styled(TableCell)<{ hideHeaders: boolean }>`
	user-select: none;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 18px;
	}
	${(props) => (props.hideHeaders ? `display: none` : '')}
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
				color: ${(props) => props.theme.colors.selectedTheme.button.text};
				font-size: 12px;
				height: ${CARD_HEIGHT};
				font-family: ${(props) => props.theme.fonts.mono};
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.selectedTheme.gray};
				font-family: ${(props) => props.theme.fonts.regular};
				border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
			}
			${TableBodyRow} {
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
