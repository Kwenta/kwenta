import styled from 'styled-components';

import DistributionChart from './DistributionChart';
import OpenInterestChart from './OpenInterestChart';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';

export default function Statistics() {
	const { t } = useTranslation();
	const futuresMarketsQuery = useGetFuturesMarkets();

	const distributionData =
		futuresMarketsQuery.data?.map((m) => ({
			name: m.asset,
			value: m.marketSize.mul(m.price).toNumber(),
		})) ?? [];

	const currencyKeys = futuresMarketsQuery.data?.map((m) => m.asset);

	return (
		<Container>
			<Row bottomMargin="33px">
				<GridItem>
					<Label>Daily Volume ($USD)</Label>
					<Value>$12,488,250.20</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Cumulative Volume ($USD)</Label>
					<Value>$376,250,113.50</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="40px">
				<GridItem>
					<Label>Total Wallets</Label>
					<Value>178</Value>
				</GridItem>
				<RowSpacer3 />
				<GridItem>
					<Label>Daily Trades</Label>
					<Value>538</Value>
				</GridItem>
				<RowSpacer3 />
				<GridItem>
					<Label>Cumulative Trades</Label>
					<Value>12,630</Value>
				</GridItem>
			</Row>
			<Row bottomMargin="59px">
				<GridItem>
					<Label>Average Leverage</Label>
					<Value>$12,488,250.20</Value>
				</GridItem>
				<RowSpacer2 />
				<GridItem>
					<Label>Total Liquidations</Label>
					<Value>98</Value>
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

const Container = styled.div`
	margin-top: 20px;
`;

const Row = styled.div<{ bottomMargin: string }>`
	flex-direction: row;
	display: flex;
	flex: 1;
	width: 100%;
	margin-bottom: ${(props) => props.bottomMargin};
`;

const RowSpacer2 = styled.div`
	width: 46px;
`;

const RowSpacer3 = styled.div`
	width: 40px;
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

const MOCK_OPEN_INTEREST = [
	{
		name: 'sBTC',
		uv: 35,
		pv: 65,
	},
	{
		name: 'sETH',
		uv: 60,
		pv: 40,
	},
	{
		name: 'sLINK',
		uv: 55,
		pv: 65,
	},
];

const MOCK_DISTRIBUTION_DATA = [
	{
		name: 'sUSD',
		value: 400,
	},
	{
		name: 'sETH',
		value: 300,
	},
	{
		name: 'sBTC',
		value: 300,
	},
	{
		name: 'sLINK',
		value: 200,
	},
];
