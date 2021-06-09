import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';

interface Rate {
	rate: number;
	timestamp: number;
}

// Get the `currencyKey` rate at the beginning or `period`
const usePeriodStartSynthRateQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<Rate>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<Rate>(
		QUERY_KEYS.Rates.PeriodStartSynthRate(currencyKey as string, period),
		async () => {
			const maxTimestamp = calculateTimestampForPeriod(periodInHours);
			if (currencyKey === SYNTHS_MAP.sUSD) {
				return { rate: 1, timestamp: maxTimestamp };
			} else {
				const rates = await snxData.rate.updates({
					synth: currencyKey,
					maxTimestamp,
					max: 1,
				});
				return rates[0];
			}
		},
		{
			enabled: currencyKey,
			...options,
		}
	);
};

export default usePeriodStartSynthRateQuery;
