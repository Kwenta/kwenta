import React, { FC, useMemo, DependencyList } from 'react';
import styled, { css } from 'styled-components';
import { useTable, useFlexLayout, useSortBy, Column, Row } from 'react-table';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';

import { FlexDivCentered } from 'styles/common';

import Spinner from 'assets/svg/app/loader.svg';

export type TablePalette = 'primary';

const CARD_HEIGHT = '40px';

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string;
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
}) => {
	const memoizedColumns = useMemo(
		() => columns,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		columnsDeps
	);
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			columns: memoizedColumns,
			data,
			...options,
		},
		useSortBy,
		useFlexLayout
	);

	return (
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
									{column.isSorted ? column.isSortedDesc ? <SortDownIcon /> : <SortUpIcon /> : ' '}
								</SortIconContainer>
							)}
						</TableCellHead>
					))}
				</TableRow>
			))}
			{isLoading ? (
				<Spinner />
			) : noResultsMessage != null ? (
				noResultsMessage
			) : (
				<TableBody className="table-body" {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);

						return (
							<TableBodyRow
								className="table-body-row"
								{...row.getRowProps()}
								onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
							>
								{row.cells.map((cell) => (
									<TableCell className="table-body-cell" {...cell.getCellProps()}>
										{cell.render('Cell')}
									</TableCell>
								))}
							</TableBodyRow>
						);
					})}
				</TableBody>
			)}
		</ReactTable>
	);
};

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
	align-items: center;
	margin-left: 5px;
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
				margin-bottom: 8px;
			}
			${TableCellHead} {
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.elderberry};
			}
			${TableBodyRow} {
				background-color: ${(props) => props.theme.colors.elderberry};
				&:hover {
					> * {
						transition: transform 0.2s ease-out;
						transform: scale(1.02);
					}
				}
			}
		`}
`;

export default Table;
