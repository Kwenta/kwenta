import { StoryFn, Meta } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'

import Button from '../src/components/Button'

export default {
	title: 'Components/Button',
	component: Button,
	argTypes: {
		backgroundColor: { control: 'color' },
	},
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as Meta<typeof Button>

const Template: StoryFn<typeof Button> = (args) => <Button children="Button" {...args} />

export const Small = Template.bind({})

Small.args = {
	size: 'small',
}

export const Medium = Template.bind({})

Medium.args = {
	size: 'medium',
	style: { width: '157px' },
}

export const Danger = Template.bind({})

Danger.args = {
	size: 'medium',
	variant: 'danger',
	fullWidth: true,
	style: { width: '157px' },
}

export const Disabled = Template.bind({})

Disabled.args = {
	size: 'medium',
	style: { width: '157px' },
	disabled: true,
}

export const Primary = Template.bind({})

Primary.args = {
	size: 'medium',
	variant: 'primary',
}

export const Secondary = Template.bind({})

Secondary.args = {
	size: 'medium',
	variant: 'secondary',
}

export const Monospace = Template.bind({})

Monospace.args = {
	size: 'small',
	children: '10x',
	mono: true,
}

export const Tab = () => {
	return (
		<TabGroup>
			<TabButton title="Futures Positions" detail="$12,392.92" badgeCount={3} active />
			<TabButton title="Shorts" detail="$0" disabled />
			<TabButton title="Spot Balances" detail="$0" disabled />
		</TabGroup>
	)
}

const TabGroup = styled.div`
	display: flex;

	button {
		&:not(:last-of-type) {
			margin-right: 15px;
		}
	}
`
