import React from 'react';

import { SliderProps } from 'components/Slider/Slider';
import StyledSlider from 'components/Slider/StyledSlider';

type LeverageSliderProps = SliderProps & {
	minValue?: number;
	maxValue?: number;
	value?: number;
	defaultValue?: number;
	disabled?: boolean;
	onChangeCommitted?: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
};

const LeverageSlider: React.FC<LeverageSliderProps> = ({
	minValue,
	maxValue,
	value,
	defaultValue,
	disabled,
	onChange,
	onChangeCommitted,
}) => {
	return (
		<StyledSlider
			minValue={minValue ?? 0}
			maxValue={maxValue ?? 10}
			step={0.1}
			defaultValue={defaultValue ?? minValue ?? 0}
			value={value}
			onChange={onChange as any}
			onChangeCommitted={onChangeCommitted}
			disabled={disabled}
			marks={[
				{ value: minValue ?? 0, label: `${minValue}x` },
				{ value: maxValue ?? 10, label: `${maxValue}x` },
			]}
			valueLabelDisplay="on"
			valueLabelFormat={(v) => `${v}x`}
			$currentMark={value ?? defaultValue ?? 0}
		/>
	);
};

export default LeverageSlider;
