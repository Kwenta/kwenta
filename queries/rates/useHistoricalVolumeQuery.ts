import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';
import BigNumber from 'bignumber.js';

import { zeroBN } from 'utils/formatters/number';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';

type HistoricalVolume = Record<CurrencyKey, BigNumber>;

const useHistoricalVolumeQuery = (
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<HistoricalVolume>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalVolume>(
		QUERY_KEYS.Rates.HistoricalVolume(period),
		async () => {
			const exchanges = (await snxData.exchanges.since({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			})) as SynthExchanges;

			return exchanges.reduce((totalVol, { fromCurrencyKey, toCurrencyKey, fromAmountInUSD }) => {
				if (totalVol[fromCurrencyKey] != null) {
					totalVol[fromCurrencyKey] = totalVol[fromCurrencyKey].plus(fromAmountInUSD);
				} else {
					totalVol[fromCurrencyKey] = zeroBN;
				}
				if (totalVol[toCurrencyKey] != null) {
					totalVol[toCurrencyKey] = totalVol[toCurrencyKey].plus(fromAmountInUSD);
				} else {
					totalVol[toCurrencyKey] = zeroBN;
				}
				return totalVol;
			}, {} as HistoricalVolume);
		},
		{
			...options,
		}
	);
};

export default useHistoricalVolumeQuery;
