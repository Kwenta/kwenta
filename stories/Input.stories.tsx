import React from 'react';
import { ComponentMeta } from '@storybook/react';
import Input from '../components/Input/Input';
import NumericInput from '../components/Input/NumericInput';
import OrderSizingInput from '../components/Input/OrderSizingInput';

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

export const Numeric = () => {
	const [value, setValue] = React.useState('');

	return <NumericInput value={value} onChange={(e) => setValue(e.target.value)} />;
};

export const OrderSizing = () => {
	const [value, setValue] = React.useState('');

	return <OrderSizingInput value={value} onChange={(e) => setValue(e.target.value)} synth="sUSD" />;
};
