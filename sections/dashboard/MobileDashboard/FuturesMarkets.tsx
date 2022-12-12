import { wei } from '@synthetixio/wei';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';
import { selectMarkets, selectMarketVolumes } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import FuturesMarketsTable from '../FuturesMarketsTable';
import { HeaderContainer, MarketStatsContainer, MarketStat } from './common';

const FuturesMarkets = () => {
	const { t } = useTranslation();

	const futuresMarkets = useAppSelector(selectMarkets);
	const futuresVolumes = useAppSelector(selectMarketVolumes);

	const openInterest = useMemo(() => {
		return (
			futuresMarkets.reduce(
				(total, { openInterest }) =>
					total.add(openInterest?.shortUSD ?? wei(0)).add(openInterest?.longUSD ?? wei(0)),
				wei(0)
			) ?? null
		);
	}, [futuresMarkets]);

	const [trades, volume] = useMemo(() => {
		const { totalTrades, totalVolume } = Object.values(futuresVolumes).reduce(
			({ totalTrades, totalVolume }, { trades, volume }) => ({
				totalTrades: totalTrades.add(trades),
				totalVolume: totalVolume.add(volume),
			}),
			{
				totalTrades: wei(0),
				totalVolume: wei(0),
			}
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
						<div className="value">
							{formatDollars(volume ?? zeroBN, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">
							{t('dashboard.overview.futures-markets-table.open-interest')}
						</div>
						<div className="value">
							{formatDollars(openInterest, {
								minDecimals: 0,
							})}
						</div>
					</MarketStat>
					<MarketStat>
						<div className="title">
							{t('dashboard.overview.futures-markets-table.daily-trades')}
						</div>
						<div className="value">{formatNumber(trades ?? 0, { minDecimals: 0 })}</div>
					</MarketStat>
				</MarketStatsContainer>
			</HeaderContainer>

			<FuturesMarketsTable />
		</div>
	);
};

export default FuturesMarkets;
