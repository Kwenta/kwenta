import useSynthetixQueries from '@synthetixio/queries';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { Synths } from 'constants/currency';
import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { futuresMarketsState } from 'store/futures';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';

import SpotMarketsTable from '../SpotMarketsTable';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

const SynthMarkets: React.FC = () => {
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const { useExchangeRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const dailyTradeStats = useGetFuturesDailyTradeStats();

	const openInterest = React.useMemo(() => {
		return futuresMarkets
			.map((market) => market.marketSize.mul(market.price).toNumber())
			.reduce((total, openInterest) => total + openInterest, 0);
	}, [futuresMarkets]);

	return (
		<div>
			<HeaderContainer>
				<SectionHeader>
					<SectionTitle>Spot Markets</SectionTitle>
				</SectionHeader>
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

			<SpotMarketsTable exchangeRates={exchangeRates} />
		</div>
	);
};

export default SynthMarkets;
