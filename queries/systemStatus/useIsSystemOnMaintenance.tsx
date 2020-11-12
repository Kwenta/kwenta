import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';

const IS_PROD = !!process.env.NEXT_PUBLIC_IS_PROD;

const useIsSystemOnMaintenance = (options?: QueryConfig<boolean>) => {
	const isAppReady = useRecoilValue(appReadyState);

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
			enabled: isAppReady,
			...options,
		}
	);
};

export default useIsSystemOnMaintenance;
