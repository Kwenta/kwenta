import styled from 'styled-components';

export const Container = styled.div`
	@media only screen and (min-width: 600px) {
	}
	@media only screen and (min-width: 768px) {
	}
	@media only screen and (min-width: 992px) {
		max-width: 1040px;
		margin-left: calc((100vw - 1040px) / 2);
	}
	@media only screen and (min-width: 1200px) {
		max-width: 1400px;
		margin-left: calc((100vw - 1400px - 50px) / 2);
	}
`;

export const StatsTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 24px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;

	@media only screen and (min-width: 600px) {
		text-align: center;
	}
`;

export const ChartContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	@media only screen and (min-width: 600px) {
		gap: 20px;
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

export const Wrapper = styled.div`
	position: relative;
`;

export const VolumeWrapper = styled(ChartWrapper)``;

export const TradeContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	@media only screen and (min-width: 600px) {
		flex-direction: row;
		gap: 20px;
	}
`;

export const TradesWrapper = styled(ChartWrapper)``;

export const TradersWrapper = styled(ChartWrapper)``;

export const OpenInterestWrapper = styled(ChartWrapper)`
	overflow: scroll;
`;

export const ScrollableWrapper = styled.div`
	width: 1160px;
	height: 380px;

	@media only screen and (min-width: 992px) {
		width: 100%;
	}
`;
