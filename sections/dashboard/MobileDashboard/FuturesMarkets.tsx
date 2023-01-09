import { wei } from '@synthetixio/wei';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { selectMarketVolumes, selectOpenInterest } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatNumber } from 'utils/formatters/number';

import FuturesMarketsTable from '../FuturesMarketsTable';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

const FuturesMarkets = () => {
	const { t } = useTranslation();

	const futuresVolumes = useAppSelector(selectMarketVolumes);
	const openInterest = useAppSelector(selectOpenInterest);

	const [trades, volume] = useMemo(() => {
		const { totalTrades, totalVolume } = Object.values(futuresVolumes).reduce(
			({ totalTrades, totalVolume }, { trades, volume }) => ({
				totalTrades: totalTrades.add(trades),
				totalVolume: totalVolume.add(volume),
			}),
			{ totalTrades: wei(0), totalVolume: wei(0) }
		);
		return [totalTrades, totalVolume];
	}, [futuresVolumes]);

	return (
		<div>
			<HeaderContainer>
				<SectionHeader>
					<SectionTitle>{t('dashboard.overview.markets-tabs.futures')}</SectionTitle>
				</SectionHeader>
				<MarketStatsContainer>
					<MarketStat>
						<div className="title">
							{t('dashboard.overview.futures-markets-table.daily-volume')}
						</div>
						<div className="value">{formatDollars(volume, { minDecimals: 0 })}</div>
					</MarketStat>
					<MarketStat>
						<div className="title">
							{t('dashboard.overview.futures-markets-table.open-interest')}
						</div>
						<div className="value">{formatDollars(openInterest, { minDecimals: 0 })}</div>
					</MarketStat>
					<MarketStat>
						<div className="title">
							{t('dashboard.overview.futures-markets-table.daily-trades')}
						</div>
						<div className="value">{formatNumber(trades, { minDecimals: 0 })}</div>
					</MarketStat>
				</MarketStatsContainer>
			</HeaderContainer>

			<FuturesMarketsTable />
		</div>
	);
};

export default FuturesMarkets;
