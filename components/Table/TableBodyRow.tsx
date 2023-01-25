import React from 'react';
import { Row, TableRowProps } from 'react-table';
import styled, { css } from 'styled-components';

import { FlexDivCentered } from 'components/layout/flex';

type TableBodyRowProps = TableRowProps & {
	row: Row;
	localRef: any;
	highlightRowsOnHover?: boolean;
	onClick?: () => void;
};

const TableBodyRow: React.FC<TableBodyRowProps> = React.memo(
	({ row, localRef, highlightRowsOnHover, onClick, ...props }) => (
		<BaseTableBodyRow
			className="table-body-row"
			{...props}
			ref={localRef}
			onClick={onClick}
			$highlightRowsOnHover={highlightRowsOnHover}
		>
			{row.cells.map((cell) => (
				<TableCell className="table-body-cell" {...cell.getCellProps()}>
					{cell.render('Cell')}
				</TableCell>
			))}
		</BaseTableBodyRow>
	)
);

const BaseTableBodyRow = styled.div<{ $highlightRowsOnHover?: boolean }>`
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

export const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	&:first-child {
		padding-left: 14px;
	}
	&:last-child {
		padding-right: 14px;
	}
`;

export default TableBodyRow;
