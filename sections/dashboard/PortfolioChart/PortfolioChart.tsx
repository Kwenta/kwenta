import { FC, useMemo } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled, { useTheme } from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import * as Text from 'components/Text';
import { selectFuturesPortfolio, selectPortfolioChartData } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatShortDate } from 'utils/formatters/date';

import { Timeframe } from './Timeframe';

const PriceChart = () => {
	const theme = useTheme();
	const portfolioData = useAppSelector(selectPortfolioChartData);

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
				<Tooltip />
				<Line
					type="monotone"
					dataKey="total"
					stroke="#82ca9d"
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
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
