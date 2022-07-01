import React from 'react';
import styled from 'styled-components';
import Slider, { SliderProps as DefaultSliderProps } from '@material-ui/core/Slider';

export type SliderProps = Omit<DefaultSliderProps, 'onChange'> & {
	minValue: number;
	maxValue: number;
	steps?: number;
	onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
	className?: string;
};

const SliderComponent: React.FC<SliderProps> = ({
	minValue,
	maxValue,
	defaultValue,
	steps,
	value,
	className,
	onChange,
	onChangeCommitted,
	disabled,
	...props
}) => {
	return (
		<SliderContainer>
			<StyledSlider
				min={minValue}
				max={maxValue}
				step={steps}
				defaultValue={defaultValue ?? minValue}
				value={value}
				onChange={onChange}
				onChangeCommitted={onChangeCommitted}
				disabled={disabled}
				{...props}
				className={className}
			/>
		</SliderContainer>
	);
};
export default SliderComponent;

const SliderContainer = styled.div`
	width: 100vw;
	height: 24px;
	padding: 0 6px;
	box-sizing: border-box;
`;

const StyledSlider = styled(Slider)`
	color: transparent !important;

	.MuiSlider-markLabel {
		left: 96% !important;
	}
	.MuiSlider-markLabelActive {
		left: 2% !important;
	}

	.MuiSlider-rail {
		margin-top: -2px;
		border-radius: 2px;
		background-color: #7d6b54;
		height: 4px;
		left: 0;
		right: 0;
	}

	.MuiSlider-track {
		height: 6px;
		background-color: #7d6b54;
		margin-top: -3px;
		border-top-left-radius: 3px;
		border-bottom-left-radius: 3px;
		border-top-right-radius: 0px;
		border-bottom-right-radius: 0px;
	}

	.MuiSlider-markActive {
		width: 0px;
		height: 0px;
		background-color: transparent;
		opacity: 1;
	}

	.MuiSlider-thumb {
		background-color: ${(props) => props.theme.colors.selectedTheme.button.text};
		width: 14px;
		height: 14px;
		margin-left: initial;
		margin-top: -8px;
	}

	.MuiSlider-thumb.Mui-focusVisible,
	.MuiSlider-thumb:hover {
	}

	.MuiSlider-markLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		color: ${(props) => props.theme.colors.selectedTheme.slider.label};
		margin-left: 3px;
	}

	.MuiSlider-valueLabel {
		.PrivateValueLabel-label-5 {
			color: ${(props) => props.theme.colors.selectedTheme.button.text};
		}
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		top: initial;
		bottom: -41.5px;
	}
`;
