import React from 'react';
import styled, { css } from 'styled-components';
import { Slider } from '@reach/slider';
import { FlexDivRowCentered } from 'styles/common';

type SliderProps = {
	minValue: number;
	maxValue: number;
	steps?: number;
	startingLabel: string;
	endingLabel: string;
	value: number;
	onChange: (
		newValue: number,
		props?: { min?: number; max?: number; handlePosition?: string }
	) => void;
};

const SliderComponent: React.FC<SliderProps> = ({
	minValue,
	maxValue,
	steps,
	startingLabel,
	endingLabel,
	value,
	onChange,
}) => {
	return (
		<SliderContainer>
			<StartingLabel>{startingLabel}</StartingLabel>
			<StyledSlider min={minValue} max={maxValue} step={steps} value={value} onChange={onChange} />
			<EndingLabel>{endingLabel}</EndingLabel>
		</SliderContainer>
	);
};
export default SliderComponent;

const SliderContainer = styled(FlexDivRowCentered)`
	width: 100%;
`;

const FontStyle = css`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledSlider = styled(Slider)`
	width: 100%;
	height: 0.2rem !important;

	[data-reach-slider-track] {
		background: ${(props) => props.theme.colors.goldColors.color2};
		border-radius: 0px;
	}
	[data-reach-slider-range] {
		background: ${(props) => props.theme.colors.goldColors.color2};
		border-radius: 0px;
	}
	[data-reach-slider-handle] {
		background: ${(props) => props.theme.colors.white};
		width: 8px;
		height: 8px;
	}
`;

const StartingLabel = styled.div`
	${FontStyle}
	margin-right: 4px;
`;

const EndingLabel = styled.div`
	${FontStyle}
	margin-left: 4px;
`;
