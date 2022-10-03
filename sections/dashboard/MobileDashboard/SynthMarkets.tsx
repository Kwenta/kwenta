import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { futuresMarketsState } from 'store/futures';
import { formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import SpotMarketsTable from '../SpotMarketsTable';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

const SynthMarkets: React.FC = () => {
	const { t } = useTranslation();
	const futuresMarkets = useRecoilValue(futuresMarketsState);

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
					<SectionTitle>{t('dashboard.overview.markets-tabs.spot')}</SectionTitle>
				</SectionHeader>
				<MarketStatsContainer>
					<MarketStat>
						<div className="title">{t('dashboard.overview.spot-markets-table.24h-vol')}</div>
						<div className="value">
							{formatDollars(dailyTradeStats.data?.totalVolume || zeroBN, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">{t('dashboard.overview.spot-markets-table.open-interest')}</div>
						<div className="value">
							{formatDollars(openInterest ?? 0, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">{t('dashboard.overview.spot-markets-table.total-trades')}</div>
						<div className="value">
							{formatNumber(dailyTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })}
						</div>
					</MarketStat>
				</MarketStatsContainer>
			</HeaderContainer>

			<SpotMarketsTable />
		</div>
	);
};

export default SynthMarkets;
