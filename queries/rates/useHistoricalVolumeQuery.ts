import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

const useHistoricalVolumeQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<number>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<number>(
		QUERY_KEYS.Rates.HistoricalVolume(currencyKey!, period),
		async () => {
			const exchanges = (await snxData.exchanges.since({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			})) as SynthExchanges;

			return exchanges
				.filter((exchange) =>
					[exchange.fromCurrencyKey, exchange.toCurrencyKey].includes(currencyKey!)
				)
				.reduce((totalVolume, exchange) => {
					totalVolume += exchange.fromAmountInUSD;
					return totalVolume;
				}, 0);
		},
		{
			enabled: currencyKey,
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			...options,
		}
	);
};

export default useHistoricalVolumeQuery;
