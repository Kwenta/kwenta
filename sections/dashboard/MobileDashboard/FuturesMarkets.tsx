import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { futuresMarketsState } from 'store/futures';
import { formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import FuturesMarketsTable from '../FuturesMarketsTable';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

const FuturesMarkets = () => {
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const dailyTradeStats = useGetFuturesDailyTradeStats();

	const openInterest = useMemo(() => {
		return (
			futuresMarkets
				.map((market) => market.marketSize.mul(market.price).toNumber())
				.reduce((total, openInterest) => total + openInterest, 0) ?? null
		);
	}, [futuresMarkets]);

	return (
		<div>
			<HeaderContainer>
				<SectionHeader>
					<SectionTitle>Futures Markets</SectionTitle>
				</SectionHeader>
				<MarketStatsContainer>
					<MarketStat>
						<div className="title">24h Volume</div>
						<div className="value">
							{formatDollars(dailyTradeStats.data?.totalVolume ?? zeroBN, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">Open Interest</div>
						<div className="value">
							{formatDollars(openInterest, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">24H Trades</div>
						<div className="value">
							{formatNumber(dailyTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })}
						</div>
					</MarketStat>
				</MarketStatsContainer>
			</HeaderContainer>

			<FuturesMarketsTable />
		</div>
	);
};

export default FuturesMarkets;
