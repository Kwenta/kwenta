import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import Input from '../src/components/Input/Input'
import NumericInput from '../src/components/Input/NumericInput'

export default {
	title: 'Components/Input',
	component: Input,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof Input>

export const Default: StoryFn<typeof Input> = (args) => <Input {...args} />

export const Numeric: StoryFn<typeof NumericInput> = (args) => {
	return <NumericInput {...args} />
}

Numeric.args = {
	right: 'sUSD',
}
