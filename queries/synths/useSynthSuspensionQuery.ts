import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

export type SynthSuspended = { isSuspended: boolean; reasonCode: number };

const useSynthSuspensionQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<SynthSuspended>
) => {
	return useQuery<SynthSuspended>(
		QUERY_KEYS.Synths.Suspension(currencyKey ?? ''),
		async () => {
			const [suspended, reason] = (await synthetix.js?.contracts.SystemStatus.synthSuspension(
				ethers.utils.formatBytes32String(currencyKey!)
			)) as [boolean, BigNumberish];

			return {
				isSuspended: suspended,
				reasonCode: Number(reason),
			};
		},
		{
			enabled: synthetix.js && currencyKey != null,
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			...options,
		}
	);
};

export default useSynthSuspensionQuery;
