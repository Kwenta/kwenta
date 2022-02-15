import React, { FC, useMemo, DependencyList } from 'react';
import styled, { css } from 'styled-components';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination, Cell } from 'react-table';
import { Svg } from 'react-optimized-image';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';

import { FlexDivCentered } from 'styles/common';

import Spinner from 'assets/svg/app/loader.svg';
import Pagination from './Pagination';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 10;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
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
	} = useTable(
		{
			columns: memoizedColumns,
			data,
			initialState: {
				pageSize: showPagination ? (pageSize ? pageSize : MAX_PAGE_ROWS) : data.length,
			},
			...options,
		},
		useSortBy,
		usePagination,
		useFlexLayout
	);

	return (
		<>
			<TableContainer>
				<ReactTable {...getTableProps()} palette={palette} className={className}>
					{headerGroups.map((headerGroup) => (
						<TableRow className="table-row" {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column: any) => (
								<TableCellHead
									{...column.getHeaderProps(
										column.sortable ? column.getSortByToggleProps() : undefined
									)}
								>
									{column.render('Header')}
									{column.sortable && (
										<SortIconContainer>
											{column.isSorted ? (
												column.isSortedDesc ? (
													<StyledSortDownIcon
														src={SortDownIcon}
														viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
													/>
												) : (
													<StyledSortUpIcon
														src={SortUpIcon}
														viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`}
													/>
												)
											) : (
												<>
													<StyledSortUpIcon
														src={SortUpIcon}
														viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`}
													/>
													<StyledSortDownIcon
														src={SortDownIcon}
														viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
													/>
												</>
											)}
										</SortIconContainer>
									)}
								</TableCellHead>
							))}
						</TableRow>
					))}
					{isLoading ? (
						<StyledSpinner src={Spinner} />
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
				</ReactTable>
			</TableContainer>
			{noResultsMessage}
			{showPagination && data.length > MAX_PAGE_ROWS ? (
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
	overflow: auto;
`;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

export const TableRow = styled.div``;

const TableBody = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
`;

const TableBodyRow = styled(TableRow)`
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;

const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 18px;
	}
`;

const TableCellHead = styled(TableCell)`
	user-select: none;
`;

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const ReactTable = styled.div<{ palette: TablePalette }>`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;

	${(props) =>
		props.palette === 'primary' &&
		css`
			${TableBody} {
				max-height: calc(100% - ${CARD_HEIGHT});
			}
			${TableCell} {
				color: ${(props) => props.theme.colors.white};
				font-size: 12px;
				height: ${CARD_HEIGHT};
			}
			${TableRow} {
				background-color: ${(props) => props.theme.colors.elderberry};
				margin-bottom: 2px;
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.elderberry};
			}
			${TableBodyRow} {
				background-color: ${(props) => props.theme.colors.elderberry};
			}
		`}
`;

const StyledSortDownIcon = styled(Svg)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledSortUpIcon = styled(Svg)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.blueberry};
`;

export default Table;
