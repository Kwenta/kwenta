import { Meta } from '@storybook/react'

import Table from 'components/Table'

export default {
	title: 'Components/Table',
	component: Table,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof Table>

const data = [
	{ id: 1, name: 'First thing' },
	{ id: 2, name: 'Second thing' },
	{ id: 3, name: 'Third thing' },
]

export const Default = () => {
	return (
		<Table
			data={data}
			columns={[
				{
					header: () => <div>Number</div>,
					cell: (cell) => <div>{cell.row.original.id}</div>,
					accessorKey: 'id',
				},
				{
					header: () => <div>Name</div>,
					cell: (cell) => <div>{cell.row.original.name}</div>,
					accessorKey: 'name',
				},
			]}
		/>
	)
}
