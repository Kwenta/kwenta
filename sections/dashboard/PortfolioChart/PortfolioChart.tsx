import { isNumber } from 'lodash';
import { FC, useMemo } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled, { useTheme } from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { Body, NumericValue } from 'components/Text';
import { selectFuturesPortfolio, selectPortfolioChartData } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatShortDate, formatShortDateWithTime } from 'utils/formatters/date';
import { formatDollars, formatPercent } from 'utils/formatters/number';

import { Timeframe } from './Timeframe';

const PriceChart = () => {
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
			<LineChart data={portfolioData}>
				<XAxis
					dataKey="timestamp"
					type="number"
					tickFormatter={formatShortDate}
					domain={['dataMin', 'dataMax']}
					tickCount={10}
				/>
				<Tooltip
					wrapperStyle={{
						border: theme.colors.selectedTheme.border,
					}}
					contentStyle={{
						border: 'none',
						backgroundColor: theme.colors.selectedTheme.background,
					}}
					labelStyle={{
						textTransform: 'capitalize',
						color: theme.colors.selectedTheme.text.value,
					}}
					itemStyle={{
						textTransform: 'capitalize',
						color: theme.colors.selectedTheme.text.value,
					}}
					labelFormatter={formatShortDateWithTime}
					formatter={(value) =>
						isNumber(value) ? formatDollars(value, { minDecimals: 2 }) : value
					}
				/>
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

	// TODO: Add back cross margin when relevant
	const total = useMemo(() => portfolio.isolatedMarginFutures, [portfolio.isolatedMarginFutures]);

	const changeValue = useMemo(() => {
		if (portfolioData.length < 2) {
			return {
				value: null,
				text: '',
			};
		} else {
			const value = portfolioData[portfolioData.length - 1].total - portfolioData[0].total;
			const changeValue = portfolioData[0].total > 0 ? value / portfolioData[0].total : null;
			const text =
				value && changeValue
					? `${value > 0 ? '+' : ''}${formatDollars(value, {
							minDecimals: Math.abs(value) < 0.01 ? 4 : 2,
					  })} (${formatPercent(changeValue)})`
					: null;
			return {
				value,
				text,
			};
		}
	}, [portfolioData, total]);

	return (
		<>
			<MobileHiddenView>
				<ChartGrid>
					<ChartOverlay>
						<PortfolioTitle>Portfolio Value</PortfolioTitle>
						<PortfolioText currencyKey="sUSD" price={total} sign="$" />
						{!!changeValue.value && (
							<NumericValue colored value={changeValue.value}>
								{' '}
								{changeValue.text}{' '}
							</NumericValue>
						)}
					</ChartOverlay>
					<ChartContainer>
						<TopBar>
							<TimeframeOverlay>
								<Timeframe />
							</TimeframeOverlay>
						</TopBar>
						<StyledPriceChart />
					</ChartContainer>
				</ChartGrid>
			</MobileHiddenView>
			<MobileOnlyView>
				<ChartContainer>
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

const ChartContainer = styled.div`
	display: flex;
	flex-direction: column;
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
`;

const TopBar = styled.div<{ mobile?: boolean }>`
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

const ChartGrid = styled.div<{ mobile?: boolean }>`
	display: grid;
	grid-template-columns: 1fr 3fr;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: ${(props) => (props.mobile ? '0px' : '10px')};
	height: 260px;
`;

export default PortfolioChart;
