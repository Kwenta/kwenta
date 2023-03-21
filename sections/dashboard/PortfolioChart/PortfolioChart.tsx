import { FC, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled, { useTheme } from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { Body, NumericValue } from 'components/Text';
import { Period } from 'sdk/constants/period';
import {
	selectFuturesPortfolio,
	selectPortfolioChartData,
	selectSelectedPortfolioTimeframe,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatChartDate, formatChartTime, formatShortDateWithTime } from 'utils/formatters/date';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

import { Timeframe } from './Timeframe';

type PriceChartProps = {
	setHoverValue: (data: number | null) => void;
	setHoverTitle: (data: string | null) => void;
};

const PriceChart: FC<PriceChartProps> = ({ setHoverValue, setHoverTitle }) => {
	const theme = useTheme();
	const portfolioTimeframe = useAppSelector(selectSelectedPortfolioTimeframe);
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
				onMouseLeave={() => {
					setHoverValue(null);
					setHoverTitle(null);
				}}
				onMouseMove={(payload) => {
					if (payload.activePayload && payload.activePayload.length > 0) {
						const newTotal = payload.activePayload[0].payload?.total;

						const formattedDate = formatShortDateWithTime(
							payload.activePayload[0].payload?.timestamp
						);
						if (newTotal) {
							setHoverValue(newTotal);
							setHoverTitle(formattedDate);
						} else {
							setHoverValue(null);
							setHoverTitle(null);
						}
					} else {
						setHoverValue(null);
						setHoverTitle(null);
					}
				}}
			>
				<XAxis
					dataKey="timestamp"
					type="number"
					scale="time"
					minTickGap={75}
					tickFormatter={portfolioTimeframe === Period.ONE_WEEK ? formatChartTime : formatChartDate}
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
	const [hoverValue, setHoverValue] = useState<number | null>(null);
	const [hoverTitle, setHoverTitle] = useState<string | null>(null);

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
				(hoverValue ?? portfolioData[portfolioData.length - 1].total) - portfolioData[0].total;
			const changeValue = portfolioData[0].total > 0 ? value / portfolioData[0].total : 0;
			const text = `${value >= 0 ? '+' : ''}${formatDollars(value, {
				minDecimals: value !== 0 && Math.abs(value) < 0.01 ? 4 : 2,
			})} (${formatPercent(changeValue)})`;
			return {
				value,
				text,
			};
		}
	}, [portfolioData, hoverValue]);

	return (
		<>
			<MobileHiddenView>
				<ChartGrid>
					<ChartOverlay>
						<PortfolioTitle>{hoverTitle ? hoverTitle : 'Portfolio Value'}</PortfolioTitle>
						<PortfolioText currencyKey="sUSD" price={hoverValue || total} sign="$" />
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
								<StyledPriceChart setHoverValue={setHoverValue} setHoverTitle={setHoverTitle} />
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
						<PortfolioText currencyKey="sUSD" price={hoverValue || total} sign="$" />
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
								<StyledPriceChart setHoverValue={setHoverValue} setHoverTitle={setHoverTitle} />
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
