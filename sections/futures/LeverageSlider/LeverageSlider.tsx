import React from 'react';
import styled, { css } from 'styled-components';
import Slider from '@material-ui/core/Slider';
import imageBackground from 'assets/svg/futures/sliderbackground.svg';

type LeverageSliderProps = {
	min?: number;
	max?: number;
	value?: number;
	defaultValue?: number;
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
	onChangeCommitted: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
};

const LeverageSlider: React.FC<LeverageSliderProps> = ({
	min,
	max,
	value,
	defaultValue,
	disabled,
	onChange,
	onChangeCommitted,
}) => {
	return (
		<LeverageSliderContainer>
			<div>
				<StyledSlider
					min={min || 0}
					max={max || 10}
					step={0.1}
					defaultValue={defaultValue || 1}
					value={value}
					onChange={onChange}
					onChangeCommitted={onChangeCommitted}
					disabled={disabled}
					marks={[
						{ value: 1, label: '1x' },
						{ value: 10, label: '10x' },
					]}
					valueLabelDisplay="on"
					valueLabelFormat={(v) => `${v}x`}
					$currentMark={value || 1}
				/>
			</div>
		</LeverageSliderContainer>
	);
};

const LeverageSliderContainer = styled.div`
	width: 334px;
	height: 24px;
	background: url(${imageBackground as any}) no-repeat;
	padding: 0 19px 0 4px;
	box-sizing: border-box;
`;

const StyledSlider = styled(Slider)<{ $currentMark?: number }>`
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
		box-shadow: inset 0px 0.5px 0px rgba(255, 255, 255, 0.5);
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
		box-shadow: inset 0px 0.5px 0px rgba(255, 255, 255, 0.5);
		margin-top: -7px;
		margin-left: 1px;
		opacity: 1;
	}

	.MuiSlider-thumb {
		background-color: #e4b378;
		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.5) !important;
		width: 14px;
		height: 14px;
		margin-left: initial;
		margin-top: -8px;
	}

	.MuiSlider-thumb.Mui-focusVisible,
	.MuiSlider-thumb:hover {
		box-shadow: inset 0px 0.5px 0px rgba(255, 255, 255, 0.5) !important;
	}

	.MuiSlider-markLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		color: #787878;
		margin-left: 8px;

		${(props) =>
			props.$currentMark &&
			props.$currentMark === 1 &&
			css`
				&:nth-child(5) {
					color: #ece8e3;
				}
			`}

		${(props) =>
			props.$currentMark &&
			props.$currentMark === 10 &&
			css`
				&:nth-child(7) {
					color: #ece8e3;
				}
			`}
	}

	.MuiSlider-valueLabel {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11px;
		top: initial;
		bottom: -41px;
		${(props) =>
			props.$currentMark &&
			(props.$currentMark < 2 || props.$currentMark > 9) &&
			css`
				display: none;
			`};
	}
`;

export default LeverageSlider;
