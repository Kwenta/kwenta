import React from 'react';
import styled from 'styled-components';
import { SectionHeader } from 'sections/futures/MobileTrade/common';
import FuturesMarketsTable from '../FuturesMarketsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { Synths } from 'constants/currency';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';

const FuturesMarkets = () => {
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = React.useMemo(() => futuresMarketsQuery?.data ?? [], [
		futuresMarketsQuery?.data,
	]);

	const dailyTradeStats = useGetFuturesDailyTradeStats();

	const openInterest = React.useMemo(() => {
		return futuresMarkets
			.map((market) => market.marketSize.mul(market.price).toNumber())
			.reduce((total, openInterest) => total + openInterest, 0);
	}, [futuresMarkets]);

	return (
		<div>
			<HeaderContainer>
				<SectionHeader>Futures Markets</SectionHeader>
				<MarketStatsContainer>
					<MarketStat>
						<div className="title">24h Volume</div>
						<div className="value">
							{formatCurrency(Synths.sUSD, dailyTradeStats.data?.totalVolume || zeroBN, {
								sign: '$',
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">Open Interest</div>
						<div className="value">
							{formatCurrency(Synths.sUSD, openInterest ?? 0, {
								sign: '$',
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">Total Trades</div>
						<div className="value">
							{formatNumber(dailyTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })}
						</div>
					</MarketStat>
				</MarketStatsContainer>
			</HeaderContainer>

			<FuturesMarketsTable futuresMarkets={futuresMarkets} />
		</div>
	);
};

const HeaderContainer = styled.div`
	padding: 15px;
`;

const MarketStatsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-gap: 8px;
`;

const MarketStat = styled.div`
	border-radius: 8px;
	box-sizing: border-box;
	padding: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};

	.title {
		font-size: 12px;
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		margin-bottom: 4px;
	}

	.value {
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.bold};
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
`;

export default FuturesMarkets;
