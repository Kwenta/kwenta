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

export const Primary = Template.bind({});
Primary.args = {
	primary: true,
	children: 'Button',
};

export const Medium = Template.bind({});
Medium.args = {
	size: 'md',
	children: 'Button',
};

export const Small = Template.bind({});
Small.args = {
	size: 'sm',
	children: 'Button',
};

export const ActiveSuccess = Template.bind({});

ActiveSuccess.args = {
	size: 'md',
	children: 'Long',
	variant: 'success',
	isActive: true,
	fullWidth: true,
};
