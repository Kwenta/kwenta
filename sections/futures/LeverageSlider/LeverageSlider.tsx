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

const StyledSlider = styled(Slider)<{ $currentMark: number }>`
	.MuiSlider-markLabel {
		${(props) =>
			props.$currentMark &&
			props.$currentMark === props.minValue &&
			css`
				&:nth-child(5) {
					color: ${(props) => props.theme.colors.selectedTheme.button.text};
				}
			`}

		${(props) =>
			props.$currentMark &&
			props.$currentMark === props.maxValue &&
			css`
				&:nth-child(7) {
					color: ${(props) => props.theme.colors.selectedTheme.button.text};
				}
			`}
	}

	.MuiSlider-valueLabel {
		${(props) =>
			(props.$currentMark < props.minValue + 1 || props.$currentMark > props.maxValue - 1) &&
			css`
				display: none;
			`};
	}
`;

export default LeverageSlider;
