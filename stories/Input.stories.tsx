import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Input from '../components/Input/Input';
import NumericInput from '../components/Input/NumericInput';
import CustomInput from '../components/Input/CustomInput';

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
} as ComponentMeta<typeof Input>;

export const Default: ComponentStory<typeof Input> = (args) => <Input {...args} />;

export const Numeric: ComponentStory<typeof NumericInput> = (args) => {
	return <NumericInput {...args} />;
};

export const Custom: ComponentStory<typeof CustomInput> = (args) => {
	return <CustomInput {...args} />;
};

Custom.args = {
	right: 'sUSD',
};
