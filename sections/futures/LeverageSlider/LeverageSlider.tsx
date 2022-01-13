import React from 'react';
import styled, { css } from 'styled-components';
import Slider from '@material-ui/core/Slider';
import imageBackground from 'assets/svg/futures/sliderbackground.svg';

type LeverageSliderProps = {
	value?: number;
	defaultValue?: number;
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
	onChangeCommitted: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
};

const LeverageSlider: React.FC<LeverageSliderProps> = ({
	value,
	defaultValue,
	disabled,
	onChange,
	onChangeCommitted,
}) => {
	const [currentMark, setCurrentMark] = React.useState(1);

	return (
		<LeverageSliderContainer>
			<StyledSlider
				min={0}
				max={10}
				step={null}
				defaultValue={defaultValue || 1}
				value={value}
				onChange={(e, v) => {
					setCurrentMark(v as number);
					return onChange(e, v);
				}}
				onChangeCommitted={onChangeCommitted}
				marks={[
					{ value: 1, label: '1x' },
					{ value: 2, label: '2x' },
					{ value: 5, label: '5x' },
					{ value: 10, label: '10x' },
				]}
				disabled={disabled}
				$currentMark={currentMark}
			/>
		</LeverageSliderContainer>
	);
};

const LeverageSliderContainer = styled.div`
	width: 100%;
	height: 24px;
	background: url(${imageBackground as any}) no-repeat;
	padding: 0 5px;
`;

const StyledSlider = styled(Slider)<{ $currentMark: number }>`
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

    ${(props) =>
			props.$currentMark === 1 &&
			css`
				width: calc(10% - 17px) !important;
			`}

    ${(props) =>
			props.$currentMark === 2 &&
			css`
				width: calc(20% + 6px) !important;
			`}

  ${(props) =>
		props.$currentMark === 5 &&
		css`
			width: calc(50% - 5px) !important;
		`}

  ${(props) =>
		props.$currentMark === 10 &&
		css`
			width: calc(100% - 22px) !important;
		`}
  }

  .MuiSlider-mark {
    margin-top: -7px !important;

    &:nth-child(4) {
      margin-left: -18px;
    }

    &:nth-child(6) {
      margin-left: 5px;
    }

    &:nth-child(8) {
      margin-left: -6px;
    }

    &:nth-child(10) {
      margin-left: -23px;
    }

    &:not(.MuiSlider-markActive) {
      display: none;
    }
  }

  .MuiSlider-markActive {
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: #7d6b54;
    box-shadow: inset 0px 0.5px 0px rgba(255, 255, 255, 0.5);
    margin-top: -5px;
    opacity: 1;
  }

  .MuiSlider-thumb {
    background-color: #e4b378;
    box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.5) !important;
    width: 14px;
    height: 14px;
    margin-top: -8px;

    ${(props) =>
			props.$currentMark === 1 &&
			css`
				margin-left: -19px;
			`};

    ${(props) =>
			props.$currentMark === 2 &&
			css`
				margin-left: 4px;
			`};

    ${(props) =>
			props.$currentMark === 5 &&
			css`
				margin-left: -7px;
			`};

    ${(props) =>
			props.$currentMark === 10 &&
			css`
				margin-left: -24px;
			`};
  }

  .MuiSlider-thumb.Mui-focusVisible,
  .MuiSlider-thumb:hover {
    box-shadow: inset 0px 0.5px 0px rgba(255, 255, 255, 0.5) !important;
  }

  .MuiSlider-markLabel {
    font-family: ${(props) => props.theme.fonts.mono};
    font-size: 11px;
    color: #787878;
    text-align: center;

    &:nth-child(5) {
      margin-left: -12px;
    }

    &:nth-child(7) {
      margin-left: 11px;
    }

    &:nth-child(9) {
      margin-left: -1px;
    }

    &:nth-child(11) {
      margin-left: -18px;
    }
  }

  .MuiSlider-markLabelActive {
    color: #ece8e3;
  }
`;

export default LeverageSlider;
