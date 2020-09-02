import { useQuery, BaseQueryOptions } from 'react-query';
import { compact } from 'lodash';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKeys } from 'constants/currency';

import synthetix from 'lib/synthetix';

const useFrozenSynthsQuery = (options?: BaseQueryOptions) => {
	const frozenSynthsQuery = useQuery<CurrencyKeys, any>(
		QUERY_KEYS.Synths.FrozenSynths,
		async () => {
			const frozenSynths = await synthetix.synthSummaryUtil!.frozenSynths();
			return compact(frozenSynths.map(ethers.utils.parseBytes32String));
		},
		{
			enabled: synthetix.synthSummaryUtil,
			...options,
		}
	);

	return frozenSynthsQuery;
};

export default useFrozenSynthsQuery;
