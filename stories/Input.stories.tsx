import React from 'react';
import { ComponentMeta } from '@storybook/react';
import Input from '../components/Input/Input';

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

export const Default = () => {
	return <Input />;
};
