import { ColorType, UTCTimestamp, createChart } from 'lightweight-charts';
import { FC, useEffect, useMemo, useRef } from 'react';
import styled, { useTheme } from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import * as Text from 'components/Text';
import { selectFuturesPortfolio, selectUserPortfolioValues } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import { Timeframe } from './Timeframe';

const PriceChart = () => {
	const theme = useTheme();
	const portfolioValues = useAppSelector(selectUserPortfolioValues);
	const chartRef = useRef('');

	useEffect(() => {
		const chart = createChart(chartRef.current, {
			rightPriceScale: {
				visible: true,
				borderVisible: false,
			},
			layout: {
				background: { type: ColorType.Solid, color: '#00000000' },
				textColor: theme.colors.selectedTheme.gray,
			},
			crosshair: {
				vertLine: {
					labelBackgroundColor: theme.colors.selectedTheme.background,
				},
				horzLine: {
					labelBackgroundColor: theme.colors.selectedTheme.background,
				},
			},
			timeScale: {
				visible: true,
				timeVisible: true,
				fixLeftEdge: true,
				fixRightEdge: true,
				borderVisible: false,
			},
			grid: {
				vertLines: {
					visible: false,
				},
				horzLines: {
					visible: false,
				},
			},
			overlayPriceScales: {
				ticksVisible: true,
			},
			handleScale: false,
			handleScroll: false,
			localization: {
				priceFormatter: formatDollars,
			},
		});

		const results = portfolioValues.map((b) => ({
			value: b.total,
			time: b.timestamp as UTCTimestamp,
		}));

		const series = chart.addAreaSeries({
			topColor: 'rgba(127, 212, 130, 0.1)',
			bottomColor: 'rgba(0, 0, 0, 0)',
			lineColor: 'rgba(127, 212, 130, 1)',
			priceLineVisible: false,
			crosshairMarkerVisible: true,
			lineStyle: 0,
			lineWidth: 2,
		});
		series.setData(results);
		chart.timeScale().fitContent();

		return () => {
			chart.remove();
		};
	}, [portfolioValues, theme]);

	return <Chart ref={(chartRef as unknown) as React.RefObject<HTMLDivElement>}></Chart>;
};

const PortfolioChart: FC = () => {
	const portfolio = useAppSelector(selectFuturesPortfolio);

	// TODO: Add back cross margin when relevant
	const total = useMemo(() => portfolio.isolatedMarginFutures, [portfolio.isolatedMarginFutures]);

	return (
		<>
			<MobileHiddenView>
				<ChartContainer>
					<TopBar>
						<ChartOverlay>
							<PortfolioText currencyKey="sUSD" price={total} sign="$" />
							<PortfolioTitle>Isolated Margin</PortfolioTitle>
						</ChartOverlay>
						<TimeframeOverlay>
							<Timeframe />
						</TimeframeOverlay>
					</TopBar>
					<StyledPriceChart />
				</ChartContainer>
			</MobileHiddenView>
			<MobileOnlyView>
				<ChartContainer mobile>
					<TopBar mobile>
						<TimeframeOverlay>
							<Timeframe />
						</TimeframeOverlay>
					</TopBar>
					<StyledPriceChart />
				</ChartContainer>
			</MobileOnlyView>
		</>
	);
};

const ChartContainer = styled.div<{ mobile?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: ${(props) => (props.mobile ? '0px' : '10px')};
	height: 260px;
`;

const TopBar = styled.div<{ mobile?: boolean }>`
	display: flex;
	flex-direction: row;
	justify-content: ${(props) => (props.mobile ? 'end' : 'space-between')};
	align-items: center;
	margin: 10px 10px 0 10px;
`;

const Chart = styled.div`
	width: 100%;
	height: 80%;
`;

const StyledPriceChart = styled(PriceChart)``;

const ChartOverlay = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
`;

const TimeframeOverlay = styled.div`
	max-width: 192px;
`;

const PortfolioTitle = styled(Text.Body).attrs({ variant: 'bold' })`
	color: rgba(127, 212, 130, 1);
	font-size: 16px;
`;

const PortfolioText = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.monoBold};
	letter-spacing: -1.2px;
	font-size: 20px;

	span {
		line-height: 27px;
	}
`;

export default PortfolioChart;
