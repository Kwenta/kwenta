import styled, { css } from 'styled-components';

import Slider from '.';

const StyledSlider = styled(Slider)<{ $currentMark: number }>`
	.MuiSlider-markLabel {
		${(props) =>
			props.$currentMark &&
			props.$currentMark === props.minValue &&
			css`
				&:nth-child(5) {
					color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
				}
			`}

		${(props) =>
			props.$currentMark &&
			props.$currentMark === props.maxValue &&
			css`
				&:nth-child(7) {
					color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
				}
			`}
	}

	.MuiSlider-valueLabel {
		${(props) =>
			(props.$currentMark < props.minValue + 1 || props.$currentMark > props.maxValue - 1) &&
			css`
				display: none;
			`};
	}
`;

export default StyledSlider;
