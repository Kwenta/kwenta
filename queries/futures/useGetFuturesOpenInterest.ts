import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { FuturesOpenInterest } from './types';
import { mapOpenInterest } from './utils';

const useGetFuturesOpenInterest = (
	currencyKeys: string[],
	options?: UseQueryOptions<FuturesOpenInterest[]>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<FuturesOpenInterest[]>(
		QUERY_KEYS.Futures.OpenInterest(currencyKeys),
		async () => {
			const { contracts } = synthetixjs!;

			return mapOpenInterest(currencyKeys, contracts);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesOpenInterest;
