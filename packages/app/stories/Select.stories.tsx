import { Meta, StoryFn } from '@storybook/react'

import Select from 'components/Select'

export default {
	title: 'Components/Select',
	component: Select,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof Select>

const Template: StoryFn<typeof Select> = (args) => <Select {...args} />

export const Default = Template.bind({})

Default.args = {
	value: { value: 'One', label: 'One' },
	options: [
		{ value: 'One', label: 'One' },
		{ value: 'Two', label: 'Two' },
		{ value: 'Three', label: 'Three' },
	],
}
