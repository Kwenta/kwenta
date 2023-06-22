import { StoryFn } from '@storybook/react'

import Loader from 'components/Loader'

export default {
	title: 'Components/Loader',
	component: Loader,
}

const Template: StoryFn<typeof Loader> = (args) => <Loader {...args} />

export const Default = Template.bind({})
