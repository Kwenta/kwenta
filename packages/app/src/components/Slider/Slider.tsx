import Slider, { SliderProps as DefaultSliderProps, sliderClasses } from '@mui/base/Slider'
import React from 'react'
import styled, { css } from 'styled-components'

import media from 'styles/media'

import ValueLabel from './ValueLabel'

export type SliderProps = DefaultSliderProps & {
	minValue: number
	maxValue: number
	steps?: number
	// onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void
	className?: string
}

const SliderComponent: React.FC<SliderProps> = ({
	minValue,
	maxValue,
	defaultValue,
	steps,
	...props
}) => {
	return (
		<SliderContainer>
			<StyledSlider
				min={minValue}
				max={maxValue}
				step={steps}
				marks
				// valueLabelDisplay="auto"
				defaultValue={defaultValue ?? minValue}
				// ValueLabelComponent={ValueLabel}
				slots={{ valueLabel: ValueLabel }}
				{...props}
			/>
		</SliderContainer>
	)
}

export default SliderComponent

export const getStep = (maxValue: number) => {
	if (maxValue < 0.01) return 0.0001
	if (maxValue < 0.1) return 0.001
	if (maxValue < 10) return 0.01
	if (maxValue < 100) return 1
	if (maxValue < 10000) return 10
	return Math.pow(10, Math.floor(Math.log10(maxValue)) - 3)
}

const styledMarkLabel = css`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.slider.label};
	${media.lessThan('sm')`
		top: 30px;
	`}
`

const SliderContainer = styled.div`
	width: 100%;
	height: 24px;
	padding: 0px 12px 0px 4px;
	box-sizing: border-box;
`

const StyledSlider = styled(Slider)`
	color: transparent !important;

	& .${sliderClasses.root} {
		padding: 10px 0px 10px 4px;
	}

	& .${sliderClasses.rail} {
		width: 102%;
		margin-top: -2px;
		border-radius: 2px;
		background-color: ${(props) => props.theme.colors.selectedTheme.slider.rail.background};
		height: 4px;
		left: 0;
		right: 0;
	}

	& .${sliderClasses.track} {
		height: 6px;
		background-color: ${(props) => props.theme.colors.selectedTheme.slider.track.background};
		margin-top: -3px;
		border-top-left-radius: 3px;
		border-bottom-left-radius: 3px;
		border-top-right-radius: 0px;
		border-bottom-right-radius: 0px;
	}

	& .${sliderClasses.markActive} {
		width: 0px;
		height: 0px;
		background-color: transparent;
		opacity: 1;
	}

	& .${sliderClasses.thumb} {
		background-color: ${(props) => props.theme.colors.selectedTheme.yellow};
		border: ${(props) => props.theme.colors.selectedTheme.slider.thumb.border};
		width: 18px;
		height: 18px;
		margin-left: -4px;
		margin-top: -10px;
		&.Mui-disabled {
			background-color: transparent;
		}
	}

	& .${sliderClasses.markLabelActive} {
		${styledMarkLabel}
		margin-left: 6px;
	}

	& .${sliderClasses.markLabel}[data-index='1'] {
		${styledMarkLabel}
		margin-left: -3px;
	}

	& .${sliderClasses.markLabel}:nth-child(7) {
		color: #787878 !important;
	}
`
