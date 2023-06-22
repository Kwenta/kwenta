import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import Slider from '../src/components/Slider/Slider'

export default {
	title: 'Components/Slider',
	component: Slider,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof Slider>

export const Default: StoryFn<typeof Slider> = (args) => {
	return <Slider {...args} />
}

Default.args = {
	minValue: 0,
	maxValue: 10,
	steps: 0.1,
	defaultValue: 0,
	marks: [
		{ value: 0, label: '0x' },
		{ value: 10, label: '10x' },
	],
	// eslint-disable-next-line
	onChange: (_, v) => console.log(`Value: ${v}`),
	// eslint-disable-next-line
	onChangeCommitted: (_, v) => console.log(`Value committed: ${v}`),
}
