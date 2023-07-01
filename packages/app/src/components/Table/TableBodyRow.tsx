import { Row, flexRender } from '@tanstack/react-table'
import React from 'react'
import styled, { css } from 'styled-components'
import { genericMemo } from 'types/helpers'

import { FlexDivCentered } from 'components/layout/flex'

type TableBodyRowProps<T> = {
	row: Row<T>
	localRef: any
	highlightRowsOnHover?: boolean
	onClick?: () => void
}

const TableBodyRow = genericMemo(
	<T,>({ row, localRef, highlightRowsOnHover, onClick }: TableBodyRowProps<T>) => (
		<BaseTableBodyRow
			className="table-body-row"
			ref={localRef}
			onClick={onClick}
			$highlightRowsOnHover={highlightRowsOnHover}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell className="table-body-cell">
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</BaseTableBodyRow>
	)
)

const BaseTableBodyRow = styled.div<{ $highlightRowsOnHover?: boolean }>`
	${(props) => css`
		cursor: ${props.onClick ? 'pointer' : 'default'};

		:not(:last-child) {
			border-bottom: ${props.theme.colors.selectedTheme.border};
		}

		padding: 6px 0;

		&:nth-child(odd) {
			background-color: ${props.theme.colors.selectedTheme.table.fill};
		}

		${props.$highlightRowsOnHover &&
		css`
			&:hover {
				background-color: ${props.theme.colors.selectedTheme.table.hover};
			}
		`}
	`}
`

export const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		padding-right: 14px;
	}
`

export default TableBodyRow
