import React from 'react';
import styled from 'styled-components';
import Slider, { SliderProps as DefaultSliderProps } from '@material-ui/core/Slider';
import imageBackground from 'assets/svg/futures/sliderbackground.svg';

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
	width: 334px;
	height: 24px;
	background: url(${imageBackground as any}) no-repeat;
	padding: 0 19px 0 4px;
	box-sizing: border-box;
`;

const StyledSlider = styled(Slider)`
	color: transparent !important;

	.MuiSlider-rail {
		margin-top: -11px;
		background-color: transparent;
		height: 24px;
		left: 0;
		right: 0;
	}

	.MuiSlider-track {
		height: 4px;
		background-color: #7d6b54;
		box-shadow: ${(props) => props.theme.colors.current.slider.track.shadow};
		margin-top: -3px;
		border-radius: 2px;
		margin-left: 1px;
		margin-right: 4px;
	}

	.MuiSlider-markActive {
		width: 12px;
		height: 12px;
		border-radius: 6px;
		background-color: #7d6b54;
		box-shadow: ${(props) => props.theme.colors.current.slider.track.shadow};
		margin-top: -7px;
		margin-left: 1px;
		opacity: 1;
	}

	.MuiSlider-thumb {
		background-color: #e4b378;
		box-shadow: ${(props) => props.theme.colors.current.slider.thumb.hover.shadow} !important;
		width: 14px;
		height: 14px;
		margin-left: initial;
		margin-top: -8px;
	}

	.MuiSlider-thumb.Mui-focusVisible,
	.MuiSlider-thumb:hover {
		box-shadow: ${(props) => props.theme.colors.current.slider.thumb.hover.shadow} !important;
	}

	.MuiSlider-markLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		color: ${(props) => props.theme.colors.current.slider.label};
		margin-left: 8px;
	}

	.MuiSlider-valueLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		top: initial;
		bottom: -41px;
	}
`;
