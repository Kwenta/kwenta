import React from 'react';
import styled, { css } from 'styled-components';
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

const styledMarkLabel = css`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.slider.label};
	${media.lessThan('sm')`
		top: -5px;
	`}
`;
const SliderContainer = styled.div`
	width: 100vw;
	height: 24px;
	padding: 0 6px;
	box-sizing: border-box;
	${media.lessThan('sm')`
		padding: 0 4px 0 4px;
	`}
`;

const StyledSlider = styled(Slider)`
	color: transparent !important;

	.MuiSlider-root {
		padding: 10px 0;
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

	.MuiSlider-markLabelActive {
		${styledMarkLabel}
		margin-left: 6px;
	}

	.MuiSlider-markLabel[data-index='1'] {
		${styledMarkLabel}
		margin-left: -16px;
	}

	.MuiSlider-valueLabel {
		span[class^='PrivateValueLabel-label'] {
			color: ${(props) => props.theme.colors.selectedTheme.button.text};
		}
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		top: initial;
		bottom: -41.5px;
		${media.lessThan('sm')`
			top: -15px;
		`}
	}
`;
