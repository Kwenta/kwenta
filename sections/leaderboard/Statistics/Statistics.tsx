import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Loader from 'components/Loader';
import { Synths } from 'constants/currency';
import useGetFuturesCumulativeStats from 'queries/futures/useGetFuturesCumulativeStats';
import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import media from 'styles/media';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

import DistributionChart from './DistributionChart';
import OpenInterestChart from './OpenInterestChart';

export default function Statistics() {
	const { t } = useTranslation();
	const futuresCumulativeStatsQuery = useGetFuturesCumulativeStats();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const dailyTradeStats = useGetFuturesDailyTradeStats();

	const distributionData =
		futuresMarketsQuery.data?.map((m) => ({
			name: m.asset,
			value: m.marketSize.mul(m.price).toNumber(),
		})) ?? [];

	const currencyKeys = futuresMarketsQuery.data?.map((m) => m.asset);
	const cumulativeVolume = formatUsdValue(futuresCumulativeStatsQuery.data?.totalVolume);
	const averageTradeSize = formatUsdValue(futuresCumulativeStatsQuery.data?.averageTradeSize);

	return (
		<Container>
			<Row bottomMargin="33px">
				<GridItem>
					<Label>Daily Volume ($USD)</Label>
					<Value>
						{dailyTradeStats.isLoading ? (
							<Loader />
						) : (
							formatCurrency(Synths.sUSD, dailyTradeStats.data?.totalVolume || zeroBN, {
								sign: '$',
								minDecimals: 2,
							})
						)}
					</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Cumulative Volume ($USD)</Label>
					<Value>{futuresCumulativeStatsQuery.isLoading ? <Loader /> : cumulativeVolume}</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="40px">
				<RowSpacer3 />
				<GridItem>
					<Label>Daily Trades</Label>
					<Value>
						{dailyTradeStats.isLoading ? <Loader /> : dailyTradeStats.data?.totalTrades ?? '-'}
					</Value>
				</GridItem>
				<RowSpacer3 />
				<GridItem>
					<Label>Cumulative Trades</Label>
					<Value>
						{futuresCumulativeStatsQuery.isLoading ? (
							<Loader />
						) : (
							futuresCumulativeStatsQuery.data?.totalTrades ?? '-'
						)}
					</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="59px">
				<GridItem>
					<Label>Average Trade Size</Label>
					<Value>{futuresCumulativeStatsQuery.isLoading ? <Loader /> : averageTradeSize}</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Total Liquidations</Label>
					<Value>
						{futuresCumulativeStatsQuery.isLoading ? (
							<Loader />
						) : (
							futuresCumulativeStatsQuery.data?.totalLiquidations ?? '-'
						)}
					</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="30px">
				<OpenInterestContainer>
					<Label>{t('leaderboard.statistics.open-interest.title')}</Label>
					<OpenInterest>
						{currencyKeys ? <OpenInterestChart currencyKeys={currencyKeys} /> : <Loader inline />}
					</OpenInterest>
				</OpenInterestContainer>
				<RowSpacer2 />
				<DistributionContainer>
					<Label>{t('leaderboard.statistics.distribution.title')}</Label>
					{futuresMarketsQuery.isLoading || futuresMarketsQuery.isIdle ? (
						<Loader inline />
					) : futuresMarketsQuery.isError ? (
						<div>{t('leaderboard.statistics.failed-loading')}</div>
					) : (
						<DistributionChart data={distributionData} />
					)}
				</DistributionContainer>
			</Row>
		</Container>
	);
}

const formatUsdValue = (value: string | undefined) => {
	return value
		? formatCurrency(Synths.sUSD, value, {
				sign: '$',
				maxDecimals: 2,
		  })
		: '-';
};

const MOBILE_PADDING = '24px';

const Container = styled.div`
	margin-top: 20px;
`;

const Row = styled.div<{ bottomMargin: string }>`
	flex-direction: row;
	display: flex;
	flex: 1;
	width: 100%;
	margin-bottom: ${(props) => props.bottomMargin};
	${media.lessThan('md')`
		display: block;
		margin-bottom: ${MOBILE_PADDING};
	`}
`;

const RowSpacer2 = styled.div`
	width: 46px;
	${media.lessThan('md')`
		height: ${MOBILE_PADDING};
	`}
`;

const RowSpacer3 = styled.div`
	width: 40px;
	${media.lessThan('md')`
		height: ${MOBILE_PADDING};
	`}
`;

const GridItem = styled.div`
	flex: 1;
	text-align: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 24px;
	border-radius: 3px;
	border-width: 1px;
	border-style: solid;
	border-color: #17172b;
`;

const Label = styled.div`
	color: ${(props) => props.theme.colors.goldColors.color1};
	padding-bottom: 12px;
`;

const Value = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 32px;
	line-height: 38px;
	${media.lessThan('sm')`
		font-size: 24px;
		line-height: 28px;
	`}
`;

const OpenInterestContainer = styled(GridItem)`
	flex: 2;
	height: 400px;
`;

const DistributionContainer = styled(GridItem)`
	flex: 1;
	height: 400px;
`;

const OpenInterest = styled.div`
	margin-top: 14px;
`;
