import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { Participant } from './types';
import axios from 'axios';

const useGetRegisteredParticpants = (options?: UseQueryOptions<Participant[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<Participant[]>(
		QUERY_KEYS.Futures.Participants(),
		async () =>
			(await axios.get('https://us-central1-golden-kwenary.cloudfunctions.net/findParticipants'))
				.data,
		{
			enabled: isAppReady && isL2,
			...options,
		}
	);
};

export default useGetRegisteredParticpants;
