import { Meta, StoryFn } from '@storybook/react'

import Badge from 'components/Badge'

export default {
	title: 'Components/Badge',
	component: Badge,
} as Meta<typeof Badge>

const Template: StoryFn<typeof Badge> = (args) => <Badge {...args}>Badge</Badge>

export const Default = Template.bind({})

export const Dark = Template.bind({})

Dark.args = {
	dark: true,
}

export const Gray = Template.bind({})

Gray.args = {
	color: 'gray',
}

export const Red = Template.bind({})

Red.args = {
	color: 'red',
}
