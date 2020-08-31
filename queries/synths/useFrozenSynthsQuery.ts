import { useQuery } from 'react-query';
import { compact } from 'lodash';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKeys } from 'constants/currency';

import snxContracts from 'lib/snxContracts';

const useFrozenSynthsQuery = () => {
	const frozenSynthsQuery = useQuery<CurrencyKeys, any>(
		QUERY_KEYS.Synths.FrozenSynths,
		async () => {
			const frozenSynths = await snxContracts.synthSummaryUtil!.frozenSynths();
			return compact(frozenSynths.map(ethers.utils.parseBytes32String));
		},
		{
			enabled: snxContracts.synthSummaryUtil,
		}
	);

	return frozenSynthsQuery;
};

export default useFrozenSynthsQuery;
