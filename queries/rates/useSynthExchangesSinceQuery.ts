import { useQuery, BaseQueryOptions } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';

const useSynthExchangesSinceQuery = (
	period: Period = Period.ONE_DAY,
	options?: BaseQueryOptions
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<SynthExchanges, any>(
		QUERY_KEYS.Rates.SynthExchanges(period),
		async () =>
			snxData.exchanges.since({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			}),
		options
	);
};

export default useSynthExchangesSinceQuery;
