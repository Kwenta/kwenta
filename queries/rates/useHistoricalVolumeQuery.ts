import { useQuery, QueryConfig } from 'react-query';
import synthetixData from '@synthetixio/data';
import BigNumber from 'bignumber.js';

import { zeroBN } from 'utils/formatters/number';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';
import { isL2State } from 'store/wallet';
import { useRecoilValue } from 'recoil';

type HistoricalVolume = Record<CurrencyKey, BigNumber>;

const useHistoricalVolumeQuery = (
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<HistoricalVolume | null>
) => {
	const isL2 = useRecoilValue(isL2State);
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<HistoricalVolume | null>(
		QUERY_KEYS.Rates.HistoricalVolume(period, isL2),
		async () => {
			const exchanges = (await synthetixData({ useOvm: isL2 }).synthExchanges({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			})) as SynthExchanges;

			return exchanges?.reduce((totalVol, { fromCurrencyKey, toCurrencyKey, fromAmountInUSD }) => {
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
		options
	);
};

export default useHistoricalVolumeQuery;
