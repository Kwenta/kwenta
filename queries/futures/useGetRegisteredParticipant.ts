import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import axios from 'axios';

const useGetRegisteredParticipant = (walletAddress: string, options?: UseQueryOptions<boolean>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<boolean>(
		QUERY_KEYS.Futures.Participant(walletAddress),
		async () => {
			const response = await axios
				.get(
					`https://us-central1-golden-kwenary.cloudfunctions.net/readParticipant?address=${walletAddress}`
				)
				.then(() => {
					return true;
				})
				.catch((error) => {
					if (error.response.status === 404) {
						console.log('Unregistered participant!');
						return false;
					}
					return false; // assume they aren't registered
				});
			return response;
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress,
			...options,
		}
	);
};

export default useGetRegisteredParticipant;
