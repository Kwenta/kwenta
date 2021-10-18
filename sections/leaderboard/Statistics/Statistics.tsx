import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import DistributionChart from './DistributionChart';
import OpenInterestChart from './OpenInterestChart';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesCumulativeTrades from 'queries/futures/useGetFuturesCumulativeTrades';
import useGetFuturesCumulativeVolume from 'queries/futures/useGetFuturesCumulativeVolume';

import useGetFuturesDayTradeStats from 'queries/futures/useGetFuturesDayTradeStats';
import useGetFuturesTotalLiquidations from 'queries/futures/useGetFuturesTotalLiquidations';
import useGetFuturesAverageTradeSize from 'queries/futures/useGetFuturesAverageTradeSize';
import Loader from 'components/Loader';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import useGetRegisteredParticpants from 'queries/futures/useGetRegisteredParticpants';
import media from 'styles/media';

export default function Statistics() {
	const { t } = useTranslation();
	const futuresCumulativeTradesQuery = useGetFuturesCumulativeTrades();
	const futuresCumulativeVolumeQuery = useGetFuturesCumulativeVolume();
	const futuresTotalLiquidationsQuery = useGetFuturesTotalLiquidations();
	const futuresAverageTradeSizeQuery = useGetFuturesAverageTradeSize();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const allVolumeQuery = useGetFuturesDayTradeStats();
	const totalWalletsQuery = useGetRegisteredParticpants();

	const distributionData =
		futuresMarketsQuery.data?.map((m) => ({
			name: m.asset,
			value: m.marketSize.mul(m.price).toNumber(),
		})) ?? [];

	const currencyKeys = futuresMarketsQuery.data?.map((m) => m.asset);
	const totalWallets = totalWalletsQuery.data?.length ?? '-';
	const cumulativeTrades = futuresCumulativeTradesQuery?.data ?? '-';
	const cumulativeVolume = futuresCumulativeVolumeQuery?.data ?? '-';
	const totalLiquidations = futuresTotalLiquidationsQuery?.data ?? '-';
	const averageTradeSize = futuresAverageTradeSizeQuery?.data ?? null;

	return (
		<Container>
			<Row bottomMargin="33px">
				<GridItem>
					<Label>Daily Volume ($USD)</Label>
					<Value>
						{allVolumeQuery.isLoading ? (
							<Loader />
						) : (
							formatCurrency(Synths.sUSD, allVolumeQuery.data?.volume || zeroBN, {
								sign: '$',
								minDecimals: 2,
							})
						)}
					</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Cumulative Volume ($USD)</Label>
					<Value>{futuresCumulativeVolumeQuery.isLoading ? <Loader /> : cumulativeVolume}</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="40px">
				<GridItem>
					<Label>Total Wallets</Label>
					<Value>{totalWalletsQuery.isLoading ? <Loader /> : totalWallets}</Value>
				</GridItem>
				<RowSpacer3 />
				<GridItem>
					<Label>Daily Trades</Label>
					<Value>
						{allVolumeQuery.isLoading ? <Loader /> : allVolumeQuery.data?.totalTrades ?? '-'}
					</Value>
				</GridItem>
				<RowSpacer3 />
				<GridItem>
					<Label>Cumulative Trades</Label>
					<Value>{futuresCumulativeTradesQuery.isLoading ? <Loader /> : cumulativeTrades}</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="59px">
				<GridItem>
					<Label>Average Trade Size</Label>
					<Value>{futuresAverageTradeSizeQuery.isLoading ? <Loader /> : averageTradeSize}</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Total Liquidations</Label>
					<Value>{futuresTotalLiquidationsQuery.isLoading ? <Loader /> : totalLiquidations}</Value>
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
	color: ${(props) => props.theme.colors.white};
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
