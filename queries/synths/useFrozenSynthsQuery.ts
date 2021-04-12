import { QueryConfig, useQuery } from 'react-query';
import compact from 'lodash/compact';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

export type FrozenSynths = Set<CurrencyKey>;

const useFrozenSynthsQuery = (options?: QueryConfig<FrozenSynths>) => {
	return useQuery<FrozenSynths>(
		QUERY_KEYS.Synths.FrozenSynths,
		async () => {
			const frozenSynths = await synthetix.js?.contracts.SynthUtil!.frozenSynths();

			return new Set<CurrencyKey>([
				...compact(frozenSynths.map(ethers.utils.parseBytes32String)),
			] as CurrencyKey[]);
		},
		{
			enabled: synthetix.js,
			...options,
		}
	);
};

export default useFrozenSynthsQuery;
