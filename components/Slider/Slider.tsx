import React from 'react';
import styled from 'styled-components';
import Slider, { SliderProps as DefaultSliderProps } from '@material-ui/core/Slider';
import media from 'styles/media';

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
	padding: 0 8px 0 8px;
	box-sizing: border-box;
	${media.lessThan('sm')`
		margin-bottom: 10px;
	`}
`;

const StyledSlider = styled(Slider)`
	color: transparent !important;

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
		box-shadow: ${(props) => props.theme.colors.selectedTheme.slider.track.shadow};
		margin-top: -3px;
		border-radius: 2px;
	}

	.MuiSlider-markActive {
		width: 0px;
		height: 0px;
		background-color: transparent;
		opacity: 1;
	}

	.MuiSlider-thumb {
		background-color: #e4b378;
		box-shadow: ${(props) => props.theme.colors.selectedTheme.slider.thumb.shadow} !important;
		width: 14px;
		height: 14px;
		margin-left: initial;
		margin-top: -8px;
	}

	.MuiSlider-thumb.Mui-focusVisible,
	.MuiSlider-thumb:hover {
		box-shadow: ${(props) => props.theme.colors.selectedTheme.slider.thumb.shadow} !important;
	}

	.MuiSlider-markLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		color: ${(props) => props.theme.colors.selectedTheme.slider.label};
		margin-left: 3px;
		${media.lessThan('sm')`
			margin-left: 0px;
		`}
	}

	.MuiSlider-valueLabel {
		.PrivateValueLabel-label-5 {
			color: ${(props) => props.theme.colors.selectedTheme.slider.label};
		}
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		top: initial;
		bottom: -41.5px;
	}
`;
