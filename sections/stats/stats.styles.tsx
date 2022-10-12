import styled from 'styled-components';

export const StatsTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 24px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;

	@media only screen and (min-width: 600px) {
		text-align: center;
	}
`;

export const StatsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1 100%;
	gap: 15px;

	@media only screen and (min-width: 600px) {
		grid-template-columns: repeat(2, 50%);
	}
`;

export const ChartContainer = styled.div<{ width: number }>`
	grid-column: span 1;

	@media only screen and (min-width: 600px) {
		grid-column: span ${(props) => props.width};
	}
`;

export const ChartWrapper = styled.div`
	width: 100%;
	height: 380px;

	canvas {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		/* Highlight-Glow */

		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.08),
			inset 0px 0px 20px rgba(255, 255, 255, 0.03);
		border-radius: 15px;
	}
`;
