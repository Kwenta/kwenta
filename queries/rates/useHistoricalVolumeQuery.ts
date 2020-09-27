import { useQuery, BaseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { Period } from 'constants/period';

import useSynthExchangesSinceQuery from './useSynthExchangesSinceQuery';
import { getVolume } from './utils';

const useHistoricalVolumeQuery = (
	currencyKey: CurrencyKey | null,
	period: Period = Period.ONE_DAY,
	options?: BaseQueryOptions
) => {
	const synthExchangesQuery = useSynthExchangesSinceQuery(period, options);
	return useQuery<number, any>(
		QUERY_KEYS.Rates.HistoricalVolume(currencyKey!, period),
		async () => getVolume(synthExchangesQuery.data || [], currencyKey!),
		{
			enabled: currencyKey && synthExchangesQuery.isSuccess,
			...options,
		}
	);
};

export default useHistoricalVolumeQuery;
