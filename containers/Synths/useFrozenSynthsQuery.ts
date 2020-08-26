import { useQuery, queryCache, AnyQueryKey } from 'react-query';

import Contracts from 'containers/Contracts';
import QUERY_KEYS from 'constants/queryKeys';
import { compact } from 'lodash';
import { ethers } from 'ethers';
import { CurrencyKeys } from 'constants/currency';

const useFrozenSynthsQuery = () => {
	const { synthSummaryUtil } = Contracts.useContainer();

	const frozenSynthsQuery = useQuery<CurrencyKeys, any>(
		QUERY_KEYS.Synths.FrozenSynths,
		async () => {
			const frozenSynths = await synthSummaryUtil!.frozenSynths();
			return compact(frozenSynths.map(ethers.utils.parseBytes32String));
		},
		{
			enabled: synthSummaryUtil != null,
		}
	);

	return frozenSynthsQuery;
};

export default useFrozenSynthsQuery;
