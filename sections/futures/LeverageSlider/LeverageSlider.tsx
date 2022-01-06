import React from 'react';
import styled from 'styled-components';
import Slider from '@material-ui/core/Slider';

interface LeverageSliderProps {
	value?: number;
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
	onChangeCommitted: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
}

const LeverageSlider: React.FC<LeverageSliderProps> = ({ value, onChange, onChangeCommitted }) => (
	<LeverageSliderContainer>
		<StyledSlider
			min={0}
			max={10}
			defaultValue={0}
			value={value}
			onChange={onChange}
			onChangeCommitted={onChangeCommitted}
			marks={[{ value: 1 }, { value: 2 }, { value: 5 }, { value: 10 }]}
			valueLabelFormat={(value) => `${value}x`}
		/>
	</LeverageSliderContainer>
);

const LeverageSliderContainer = styled.div`
	width: 100%;
`;

const StyledSlider = styled(Slider)`
	.MuiSlider-track {
		background: #191919;
	}

	.MuiSlider-mark:not(.MuiSlider-markActive) {
		width: 12px;
		height: 12px;
		border-radius: 6px;
		background: #e4b378;
	}

	.MuiSlider-thumb {
		background-color: #e4b378;
		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.5);
		width: 14px;
		height: 14px;
	}
`;

export default LeverageSlider;
