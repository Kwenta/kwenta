import { Row, flexRender } from '@tanstack/react-table'
import React from 'react'
import styled, { css } from 'styled-components'
import { genericMemo } from 'types/helpers'

import { FlexDivCentered } from 'components/layout/flex'

import { GridLayoutStyles } from './Table'

type TableBodyRowProps<T> = {
	row: Row<T>
	localRef: any
	highlightRowsOnHover?: boolean
	onClick?: () => void
	gridLayout?: GridLayoutStyles
}

const TableBodyRow = genericMemo(
	<T,>({ row, localRef, highlightRowsOnHover, onClick, gridLayout }: TableBodyRowProps<T>) => (
		<BaseTableBodyRow
			className="table-body-row"
			ref={localRef}
			onClick={onClick}
			$highlightRowsOnHover={highlightRowsOnHover}
			$gridLayout={gridLayout?.row}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell
					key={cell.id}
					className="table-body-cell"
					style={{ width: cell.column.getSize(), flex: cell.column.getSize() }}
					$gridLayout={gridLayout?.cell}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</BaseTableBodyRow>
	)
)

const BaseTableBodyRow = styled.div<{ $highlightRowsOnHover?: boolean; $gridLayout?: string }>`
	display: flex;
	${(props) => css`
		cursor: ${props.onClick ? 'pointer' : 'default'};

		:not(:last-child) {
			border-bottom: ${props.theme.colors.selectedTheme.border};
		}

		padding: 6px 0;

		&:nth-child(even) {
			background-color: ${props.theme.colors.selectedTheme.table.fill};
		}

		${props.$highlightRowsOnHover &&
		css`
			&:hover {
				background-color: ${props.theme.colors.selectedTheme.table.hover};
			}
		`}
		${props.$gridLayout &&
		css`
			${props.$gridLayout}
		`}
	`}
`

export const TableCell = styled(FlexDivCentered)<{ $gridLayout?: string }>`
	box-sizing: border-box;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 14px;
	}

	${(props) =>
		props.$gridLayout &&
		css`
			${props.$gridLayout}
		`}
`

export default TableBodyRow
