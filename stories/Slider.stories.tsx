import React from 'react';
import { ComponentMeta } from '@storybook/react';

import LeverageSlider from '../sections/futures/LeverageSlider';

export default {
	title: 'Components/Slider',
	component: LeverageSlider,
	decorators: [
		(Story) => (
			<div
				style={{
					width: 334,
					height: 50,
					backgroundColor: '#282626',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof LeverageSlider>;

export const Default = () => {
	return (
		<LeverageSlider
			min={0}
			max={10}
			onChange={(_, v) => console.log('Value:', v)}
			onChangeCommitted={(_, v) => console.log('Value committed:', v)}
		/>
	);
};
