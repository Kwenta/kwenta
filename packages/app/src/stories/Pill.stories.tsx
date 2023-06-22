import { ComponentMeta, ComponentStory } from '@storybook/react'

import Pill from 'components/Pill'

export default {
	title: 'Components/Pill',
	component: Pill,
} as ComponentMeta<typeof Pill>

const Template: ComponentStory<typeof Pill> = (args) => <Pill {...args}>Button</Pill>

export const Default = Template.bind({})

export const Red = Template.bind({})

Red.args = {
	color: 'red',
}

export const Gray = Template.bind({})

Gray.args = {
	color: 'gray',
}

export const Outline = Template.bind({})

Outline.args = {
	outline: true,
}
