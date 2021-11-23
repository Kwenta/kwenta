import { useQuery, UseQueryOptions } from 'react-query';
import Wei, { wei } from '@synthetixio/wei';

// import { PERIOD_IN_HOURS, Period } from '../../constants';

import { calculateTimestampForPeriod } from './utils';
// import { QueryContext } from '../../context';
// import { HistoricalVolume } from '../../types';

import { CurrencyKey } from '@synthetixio/contracts-interface';

declare type HistoricalVolume = Record<CurrencyKey, Wei>;

const useHistoricalVolumeQuery = (
	// ctx: QueryContext,
	period: Period = Period.ONE_DAY,
	options?: UseQueryOptions<HistoricalVolume>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalVolume>(
		['rates', 'historicalVolume', ctx.networkId, period],
		async () => {
      const synthExchanges = await exchanges.useGetSynthExchanges(
        {
          first: Number.MAX_SAFE_INTEGER,
          where: {
            timestamp_gte: calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
          },
        },
        {
          id: true,
          account: true,
          from: true,
          fromCurrencyKey: true,
          fromAmount: true,
          fromAmountInUSD: true,
          toCurrencyKey: true,
          toAmount: true,
          toAmountInUSD: true,
          feesInUSD: true,
          toAddress: true,
          timestamp: true,
          gasPrice: true,
          block: true,
        }
      );

			return exchanges.reduce(
				(totalVol, { fromCurrencyKey, toCurrencyKey, fromAmountInUSD, toAmountInUSD }) => {
					if (totalVol[fromCurrencyKey] != null) {
						totalVol[fromCurrencyKey] = totalVol[fromCurrencyKey].add(fromAmountInUSD);
					} else {
						totalVol[fromCurrencyKey] = wei(fromAmountInUSD);
					}
					if (totalVol[toCurrencyKey] != null) {
						totalVol[toCurrencyKey] = totalVol[toCurrencyKey].add(toAmountInUSD);
					} else {
						totalVol[toCurrencyKey] = wei(toAmountInUSD);
					}
					return totalVol;
				},
				{} as HistoricalVolume
			);
		},
		{
			enabled: !!ctx.snxData,
			...options,
		}
	);
};

export default useHistoricalVolumeQuery;