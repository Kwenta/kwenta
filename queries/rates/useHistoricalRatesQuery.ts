import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, SYNTHS_MAP, sUSD_EXCHANGE_RATE } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import {
	calculateTimestampForPeriod,
	getMinAndMaxRate,
	calculateRateChange,
	mockHistoricalRates,
} from './utils';
import { HistoricalRatesUpdates, RateUpdates } from './types';

export type HistoricalRatesUpdatesMap = Record<CurrencyKey, HistoricalRatesUpdates>;

const sUSDMock = (periodInHours: number): HistoricalRatesUpdates => ({
	// @ts-ignore
	rates: mockHistoricalRates(periodInHours, sUSD_EXCHANGE_RATE),
	low: sUSD_EXCHANGE_RATE,
	high: sUSD_EXCHANGE_RATE,
	change: 0,
});

const useHistoricalRatesQuery = (
	currencyKey: CurrencyKey | CurrencyKey[] | null,
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<HistoricalRatesUpdatesMap>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalRatesUpdatesMap>(
		QUERY_KEYS.Rates.HistoricalRates(currencyKey as string, period),
		async () => {
			if (currencyKey === SYNTHS_MAP.sUSD) {
				return {
					[SYNTHS_MAP.sUSD]: sUSDMock(periodInHours),
				};
			} else {
				const rates = await snxData.rate.updates({
					synth: currencyKey,
					minTimestamp: calculateTimestampForPeriod(periodInHours),
					max: 6000,
				});

				const ratesMap = groupBy(rates, 'synth') as Record<CurrencyKey, RateUpdates>;

				const historicalRates = mapValues(ratesMap, (rates) => {
					const [low, high] = getMinAndMaxRate(rates);
					const change = calculateRateChange(rates);

					return {
						rates: rates.reverse(),
						low,
						high,
						change,
					};
				}) as HistoricalRatesUpdatesMap;

				if (currencyKey!.includes(SYNTHS_MAP.sUSD)) {
					historicalRates[SYNTHS_MAP.sUSD] = sUSDMock(periodInHours);
				}

				return historicalRates;
			}
		},
		{
			enabled: currencyKey,
			...options,
		}
	);
};

export default useHistoricalRatesQuery;
