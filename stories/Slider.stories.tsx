import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import logError from 'utils/logError';

import Slider from '../components/Slider/Slider';

export default {
	title: 'Components/Slider',
	component: Slider,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof Slider>;

export const Default: ComponentStory<typeof Slider> = (args) => {
	return <Slider {...args} />;
};

Default.args = {
	minValue: 0,
	maxValue: 10,
	steps: 0.1,
	defaultValue: 0,
	marks: [
		{ value: 0, label: '0x' },
		{ value: 10, label: '10x' },
	],
	onChange: (_, v) => logError(`Value: ${v}`),
	onChangeCommitted: (_, v) => logError(`Value committed: ${v}`),
};
