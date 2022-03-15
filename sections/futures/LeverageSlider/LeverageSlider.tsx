import React from 'react';
import styled, { css } from 'styled-components';
import Slider, { SliderProps } from 'components/Slider/Slider';

type LeverageSliderProps = SliderProps & {
	minValue?: number;
	maxValue?: number;
	value?: number;
	defaultValue?: number;
	disabled?: boolean;
	onChangeCommitted: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
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
			defaultValue={defaultValue ?? 1}
			value={value}
			onChange={onChange as any}
			onChangeCommitted={onChangeCommitted}
			disabled={disabled}
			marks={[
				{ value: minValue ?? 1, label: `${minValue ?? 1}x` },
				{ value: maxValue ?? 10, label: `${maxValue ?? 10}x` },
			]}
			valueLabelDisplay="on"
			valueLabelFormat={(v) => `${v.toFixed(1)}x`}
			$currentMark={value ?? defaultValue ?? 1}
		/>
	);
};

const StyledSlider = styled(Slider)<{ $currentMark?: number }>`
	.MuiSlider-markLabel {
		${(props) =>
			props.$currentMark &&
			props.$currentMark === 1 &&
			css`
				&:nth-child(5) {
					color: ${(props) => props.theme.colors.common.primaryWhite};
				}
			`}

		${(props) =>
			props.$currentMark &&
			props.$currentMark === 10 &&
			css`
				&:nth-child(7) {
					color: ${(props) => props.theme.colors.common.primaryWhite};
				}
			`}
	}

	.MuiSlider-valueLabel {
		${(props) =>
			props.$currentMark &&
			(props.$currentMark < 2 || props.$currentMark > 9) &&
			css`
				display: none;
			`};
	}
`;

export default LeverageSlider;
