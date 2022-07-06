import React from 'react';
import { SectionHeader } from 'sections/futures/MobileTrade/common';
import FuturesMarketsTable from '../FuturesMarketsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { Synths } from 'constants/currency';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

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

export default FuturesMarkets;
