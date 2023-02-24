import Wei from '@synthetixio/wei';
import { ColorType, UTCTimestamp, createChart } from 'lightweight-charts';
import { FC, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import * as Text from 'components/Text';
import { selectBalances } from 'state/balances/selectors';
import { selectFuturesPortfolio, selectUserPortfolioValues } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

type PortfolioChartProps = {
	exchangeTokenBalances: Wei;
};

const PriceChart = () => {
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
			},
			timeScale: {
				visible: true,
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
	}, [portfolioValues]);

	return <Chart ref={(chartRef as unknown) as React.RefObject<HTMLDivElement>}></Chart>;
};

const PortfolioChart: FC<PortfolioChartProps> = ({ exchangeTokenBalances }) => {
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const balances = useAppSelector(selectBalances);

	// TODO: Add back cross margin when relevant
	const total = useMemo(
		() => portfolio.isolatedMarginFutures.add(balances.totalUSDBalance).add(exchangeTokenBalances),
		[portfolio.isolatedMarginFutures, balances.totalUSDBalance, exchangeTokenBalances]
	);

	return (
		<>
			<MobileHiddenView>
				<ChartContainer>
					<ChartOverlay>
						<PortfolioTitle>Portfolio Value</PortfolioTitle>
						<PortfolioText currencyKey="sUSD" price={total} sign="$" />
					</ChartOverlay>
					<StyledPriceChart />
				</ChartContainer>
			</MobileHiddenView>
			<MobileOnlyView>
				<PortfolioText currencyKey="sUSD" price={total} sign="$" />
				<MobileChartPlaceholder />
			</MobileOnlyView>
		</>
	);
};

const ChartContainer = styled.div`
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	height: 200px;
`;

const Chart = styled.div`
	width: 100%;
	height: 100%;
`;

const StyledPriceChart = styled(PriceChart)`
	z-index: 3;
	position: fixed;
`;

const ChartOverlay = styled.div`
	display: block;
	z-index: 5;
	position: fixed;
`;

const PortfolioTitle = styled(Text.Body).attrs({ variant: 'bold' })`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
	margin: 26px 0 10px 26px;
`;

const PortfolioText = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.monoBold};
	letter-spacing: -1.2px;
	font-size: 27px;
	margin-left: 26px;
	margin-top: 0;
	margin-bottom: 26px;

	span {
		line-height: 27px;
	}
`;

const MobileChartPlaceholder = styled.div`
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

export default PortfolioChart;
