import { ComponentMeta, ComponentStory } from '@storybook/react'

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
} as ComponentMeta<typeof SegmentedControl>

export const Default: ComponentStory<typeof SegmentedControl> = (args) => (
	<SegmentedControl
		{...args}
		selectedIndex={0}
		values={['Market', 'Limit', 'Stop']}
		onChange={() => {}}
		styleType="check"
	/>
)
