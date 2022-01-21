import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '../components/Button';

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
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Small = Template.bind({});

Small.args = {
	size: 'sm',
	children: 'Button',
};

export const Medium = Template.bind({});

Medium.args = {
	size: 'md',
	children: 'Button',
	style: { width: '157px' },
};

export const ActiveSuccess = Template.bind({});

ActiveSuccess.args = {
	size: 'md',
	children: 'Long',
	variant: 'success',
	isActive: true,
	style: { width: '157px' },
};

export const ActiveDanger = Template.bind({});

ActiveDanger.args = {
	size: 'md',
	children: 'Short',
	variant: 'danger',
	isActive: true,
	fullWidth: true,
	style: { width: '157px' },
};

export const Disabled = Template.bind({});

Disabled.args = {
	size: 'md',
	children: 'Button',
	style: { width: '157px' },
	disabled: true,
};
