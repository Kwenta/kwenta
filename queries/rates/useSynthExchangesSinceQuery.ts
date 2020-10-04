import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { PERIOD_IN_HOURS, Period } from 'constants/period';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';

const useSynthExchangesSinceQuery = (
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<SynthExchanges>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<SynthExchanges>(
		QUERY_KEYS.Rates.SynthExchanges(period),
		async () =>
			snxData.exchanges.since({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			}),
		{
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			...options,
		}
	);
};

export default useSynthExchangesSinceQuery;
