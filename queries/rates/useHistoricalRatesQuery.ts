import { useQuery, QueryConfig } from 'react-query';
import synthetixData from '@synthetixio/data';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, SYNTHS_MAP, sUSD_EXCHANGE_RATE } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import {
	calculateTimestampForPeriod,
	getMinAndMaxRate,
	calculateRateChange,
	mockHistoricalRates,
} from './utils';
import { HistoricalRatesUpdates } from './types';
import { isL2State } from 'store/wallet';
import { useRecoilValue } from 'recoil';

const useHistoricalRatesQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<HistoricalRatesUpdates>
) => {
	const isL2 = useRecoilValue(isL2State);
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalRatesUpdates>(
		QUERY_KEYS.Rates.HistoricalRates(currencyKey as string, period, isL2),
		async () => {
			if (currencyKey === SYNTHS_MAP.sUSD) {
				return {
					rates: mockHistoricalRates(periodInHours, sUSD_EXCHANGE_RATE),
					low: sUSD_EXCHANGE_RATE,
					high: sUSD_EXCHANGE_RATE,
					change: 0,
				};
			} else {
				const rates =
					(await synthetixData({ useOvm: isL2 }).rateUpdates({
						synth: currencyKey ?? undefined,
						minTimestamp: calculateTimestampForPeriod(periodInHours),
						max: 1000,
					})) ?? [];

				const [low, high] = getMinAndMaxRate(rates);
				const change = calculateRateChange(rates);

				return {
					rates: rates.reverse(),
					low,
					high,
					change,
				};
			}
		},
		{
			enabled: currencyKey,
			...options,
		}
	);
};

export default useHistoricalRatesQuery;
