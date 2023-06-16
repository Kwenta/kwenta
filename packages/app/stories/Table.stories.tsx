import { ComponentMeta } from '@storybook/react';
import { CellProps } from 'react-table';

import Table from 'components/Table';

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
} as ComponentMeta<typeof Table>;

const data = [
	{
		id: 1,
		name: 'First thing',
	},
	{
		id: 2,
		name: 'Second thing',
	},
	{
		id: 3,
		name: 'Third thing',
	},
];

export const Default = () => {
	return (
		<Table
			data={data}
			columns={[
				{
					Header: () => <div>Number</div>,
					Cell: (cell: CellProps<typeof data[number]>) => <div>{cell.row.original.id}</div>,
					accessor: 'id',
				},
				{
					Header: () => <div>Name</div>,
					Cell: (cell: CellProps<typeof data[number]>) => <div>{cell.row.original.name}</div>,
					accessor: 'name',
				},
			]}
		/>
	);
};
