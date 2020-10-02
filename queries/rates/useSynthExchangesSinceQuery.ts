import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { PERIOD_IN_HOURS, Period } from 'constants/period';

import { calculateTimestampForPeriod } from './utils';
import { SynthExchanges } from './types';

type PromiseResult = SynthExchanges;

const useSynthExchangesSinceQuery = (
	period: Period = Period.ONE_DAY,
	options?: QueryConfig<PromiseResult>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	return useQuery<PromiseResult>(
		QUERY_KEYS.Rates.SynthExchanges(period),
		async () =>
			snxData.exchanges.since({
				minTimestamp: calculateTimestampForPeriod(periodInHours),
			}),
		options
	);
};

export default useSynthExchangesSinceQuery;
