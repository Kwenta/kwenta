import { useQuery } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod, getMinAndMaxRate, calculateRateChange } from './utils';
import { HistoricalRatesUpdates } from './types';

const useHistoricalRatesQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalRatesUpdates, any>(
		QUERY_KEYS.Rates.HistoricalRates(currencyKey as string, period),
		async () => {
			const rates = await snxData.rate.updates({
				synth: currencyKey,
				// maxTimestamp: Math.trunc(now / 1000),
				minTimestamp: calculateTimestampForPeriod(periodInHours),
				max: 6000,
			});

			const [low, high] = getMinAndMaxRate(rates);
			const change = calculateRateChange(rates);

			return {
				rates: rates.reverse(),
				low,
				high,
				change,
			};
		},
		{
			enabled: currencyKey,
		}
	);
};

export default useHistoricalRatesQuery;
