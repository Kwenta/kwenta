import React from 'react';
import { ComponentMeta } from '@storybook/react';

import Slider from '../components/Slider/Slider';
import LeverageSlider from 'sections/futures/LeverageSlider';

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

export const Default = () => {
	return (
		<Slider
			minValue={0}
			maxValue={10}
			steps={0.1}
			defaultValue={0}
			marks={[
				{ value: 0, label: '0x' },
				{ value: 10, label: '10x' },
			]}
			onChange={(_, v) => console.log('Value:', v)}
			onChangeCommitted={(_, v) => console.log('Value committed:', v)}
		/>
	);
};

export const LeverageSliderThing = () => {
	return (
		<LeverageSlider
			minValue={1}
			maxValue={10}
			defaultValue={1}
			onChange={(_, v) => console.log('Value:', v)}
			onChangeCommitted={(_, v) => console.log('Value committed:', v)}
		/>
	);
};
