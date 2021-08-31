import React from 'react';
import styled from 'styled-components';
import Slider from '@material-ui/core/Slider';
import { FlexDivRowCentered } from 'styles/common';

type SliderProps = {
	minValue: number;
	maxValue: number;
	steps?: number;
	value: number;
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
	.MuiSlider-thumb {
		background-color: ${(props) => props.theme.colors.goldColors.color2};
		width: 16px;
		height: 16px;
	}
`;
