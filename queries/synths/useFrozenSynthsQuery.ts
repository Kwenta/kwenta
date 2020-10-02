import { QueryConfig, useQuery } from 'react-query';
import { compact } from 'lodash';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

type PromiseResult = Set<CurrencyKey>;

const useFrozenSynthsQuery = (options?: QueryConfig<PromiseResult>) => {
	return useQuery<PromiseResult>(
		QUERY_KEYS.Synths.FrozenSynths,
		async () => {
			const frozenSynths = await synthetix.synthSummaryUtil!.frozenSynths();
			return new Set<CurrencyKey>([
				...compact(frozenSynths.map(ethers.utils.parseBytes32String)),
			] as CurrencyKey[]);
		},
		{
			enabled: synthetix.synthSummaryUtil,
			...options,
		}
	);
};

export default useFrozenSynthsQuery;
