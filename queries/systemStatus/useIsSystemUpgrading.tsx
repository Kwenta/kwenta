import { useQuery, QueryConfig } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

const IS_PROD = !!process.env.NEXT_PUBLIC_IS_PROD;

const useIsSystemUpgrading = (options?: QueryConfig<boolean>) => {
	return useQuery<boolean>(
		QUERY_KEYS.SystemStatus.IsUpgrading,
		async () => {
			const isSystemUpgrading = (await synthetix.js?.contracts.SystemStatus.isSystemUpgrading()) as boolean;

			return isSystemUpgrading;
		},
		{
			enabled: synthetix.js && IS_PROD,
			...options,
		}
	);
};

export default useIsSystemUpgrading;
