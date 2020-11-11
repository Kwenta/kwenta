import { useQuery, QueryConfig } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

const IS_PROD = !!process.env.NEXT_PUBLIC_IS_PROD;

const useIsSystemOnMaintenance = (options?: QueryConfig<boolean>) => {
	return useQuery<boolean>(
		QUERY_KEYS.SystemStatus.IsUpgrading,
		async () => {
			const [isSystemUpgrading, isExchangePaused] = (await Promise.all([
				synthetix.js?.contracts.SystemStatus.isSystemUpgrading(),
				synthetix.js?.contracts.DappMaintenance.isPausedSX(),
			])) as [boolean, boolean];

			return isSystemUpgrading || (isExchangePaused && IS_PROD);
		},
		{
			enabled: synthetix.js,
			...options,
		}
	);
};

export default useIsSystemOnMaintenance;
