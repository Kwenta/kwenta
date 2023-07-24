import { Meta, StoryFn } from '@storybook/react'

import SegmentedControl from 'components/SegmentedControl'

export default {
	title: 'Futures/OrderType',
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof SegmentedControl>

export const Default: StoryFn<typeof SegmentedControl> = (args) => (
	<SegmentedControl
		{...args}
		selectedIndex={0}
		values={['Market', 'Limit', 'Stop']}
		onChange={() => {}}
	/>
)
