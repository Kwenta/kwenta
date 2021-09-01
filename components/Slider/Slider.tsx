import React from 'react';
import styled from 'styled-components';
import Slider from '@material-ui/core/Slider';
import { FlexDivRowCentered } from 'styles/common';

type SliderProps = {
	minValue: number;
	maxValue: number;
	steps?: number;
	value: number;
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
	onChangeCommitted: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
};

const SliderComponent: React.FC<SliderProps> = ({
	minValue,
	maxValue,
	steps,
	value,
	onChange,
	onChangeCommitted,
	disabled,
}) => {
	return (
		<SliderContainer>
			<StyledSlider
				min={minValue}
				max={maxValue}
				step={steps}
				value={value}
				onChange={onChange}
				onChangeCommitted={onChangeCommitted}
				disabled={disabled}
			/>
		</SliderContainer>
	);
};
export default SliderComponent;

const SliderContainer = styled(FlexDivRowCentered)`
	width: 100%;
`;

const StyledSlider = styled(Slider)`
	width: 100%;

	.MuiSlider-root {
		background: ${(props) => props.theme.colors.goldColors.color2};
	}
	.MuiSlider-rail {
		background: ${(props) => props.theme.colors.goldColors.color2};
		border-radius: 4px;
		height: 6px;
	}
	.MuiSlider-track {
		background: ${(props) => props.theme.colors.goldColors.color2};
		border-radius: 4px;
		height: 6px;
	}
	.MuiSlider-thumb,
	.MuiSlider-thumb.Mui-disabled {
		background-color: ${(props) => props.theme.colors.goldColors.color2};
		width: 16px;
		height: 16px;
	}
	.MuiSlider-thumb.Mui-disabled {
		margin-top: -5px;
		margin-left: -6px;
	}
`;
