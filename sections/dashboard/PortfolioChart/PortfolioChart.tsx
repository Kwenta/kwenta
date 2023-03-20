import { FC, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled, { useTheme } from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { Body, NumericValue } from 'components/Text';
import { selectFuturesPortfolio, selectPortfolioChartData } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatShortDate } from 'utils/formatters/date';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

import { Timeframe } from './Timeframe';

type PriceChartProps = {
	setHoverData: (data: number | null) => void;
};

const PriceChart: FC<PriceChartProps> = ({ setHoverData }) => {
	const theme = useTheme();
	const portfolioData = useAppSelector(selectPortfolioChartData);

	const lineColor = useMemo(() => {
		const isNegative =
			portfolioData.length > 2
				? portfolioData[portfolioData.length - 1].total - portfolioData[0].total < 0
				: false;
		return isNegative ? theme.colors.selectedTheme.red : theme.colors.selectedTheme.green;
	}, [portfolioData, theme]);

	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart
				data={portfolioData}
				onMouseMove={(payload) => {
					if (payload.activePayload && payload.activePayload.length > 0) {
						const newTotal = payload.activePayload[0].payload?.total;
						if (newTotal) {
							setHoverData(newTotal);
						} else {
							setHoverData(null);
						}
					} else {
						setHoverData(null);
					}
				}}
			>
				<XAxis
					dataKey="timestamp"
					type="number"
					tickFormatter={formatShortDate}
					domain={['dataMin', 'dataMax']}
				/>
				<Tooltip content={<></>} />
				<Line
					type="monotone"
					dataKey="total"
					stroke={lineColor}
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

const PortfolioChart: FC = () => {
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const portfolioData = useAppSelector(selectPortfolioChartData);
	const [hoverData, setHoverData] = useState<number | null>(null);

	// TODO: Add back cross margin when relevant
	const total = useMemo(() => portfolio.isolatedMarginFutures, [portfolio.isolatedMarginFutures]);

	const changeValue = useMemo(() => {
		if (portfolioData.length < 2) {
			return {
				value: null,
				text: '',
			};
		} else {
			const value =
				(hoverData ?? portfolioData[portfolioData.length - 1].total) - portfolioData[0].total;
			const changeValue = portfolioData[0].total > 0 ? value / portfolioData[0].total : 0;
			const text = `${value >= 0 ? '+' : ''}${formatDollars(value, {
				minDecimals: value !== 0 && Math.abs(value) < 0.01 ? 4 : 2,
			})} (${formatPercent(changeValue)})`;
			return {
				value,
				text,
			};
		}
	}, [portfolioData, hoverData]);

	return (
		<>
			<MobileHiddenView>
				<ChartGrid>
					<ChartOverlay>
						<PortfolioTitle>Portfolio Value</PortfolioTitle>
						<PortfolioText currencyKey="sUSD" price={hoverData || total} sign="$" />
						<NumericValue colored value={changeValue.value ?? zeroBN}>
							{changeValue.text}&nbsp;
						</NumericValue>
					</ChartOverlay>
					<ChartContainer>
						{!!total && portfolioData.length >= 2 ? (
							<>
								<TopBar>
									<TimeframeOverlay>
										<Timeframe />
									</TimeframeOverlay>
								</TopBar>
								<StyledPriceChart setHoverData={setHoverData} />
							</>
						) : (
							<></>
						)}
					</ChartContainer>
				</ChartGrid>
			</MobileHiddenView>
			<MobileOnlyView>
				<MobileChartGrid>
					<ChartOverlay>
						<PortfolioTitle>Portfolio Value</PortfolioTitle>
						<PortfolioText currencyKey="sUSD" price={hoverData || total} sign="$" />
						<NumericValue colored value={changeValue.value ?? zeroBN}>
							{changeValue.text}&nbsp;
						</NumericValue>
					</ChartOverlay>
					<ChartContainer>
						{!!total && portfolioData.length >= 2 ? (
							<>
								<TopBar>
									<TimeframeOverlay>
										<Timeframe />
									</TimeframeOverlay>
								</TopBar>
								<StyledPriceChart setHoverData={setHoverData} />
							</>
						) : (
							<></>
						)}
					</ChartContainer>
				</MobileChartGrid>
			</MobileOnlyView>
		</>
	);
};

const ChartContainer = styled.div`
	display: flex;
	flex-direction: column;
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
`;

const TopBar = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: end;
	align-items: center;
	padding: 10px 10px 0 0;
`;

const StyledPriceChart = styled(PriceChart)``;

const ChartOverlay = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: start;
	gap: 8px;
	padding: 16px;
`;

const TimeframeOverlay = styled.div`
	max-width: 192px;
`;

const PortfolioTitle = styled(Body).attrs({ variant: 'bold' })`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
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

const MobileChartGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 5fr;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 0px;
	height: 360px;
`;

const ChartGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 3fr;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	height: 260px;
`;

export default PortfolioChart;
