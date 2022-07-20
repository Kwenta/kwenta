import axios from 'axios';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from './constants';

const useGetFile = (fileName: string) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery(
		QUERY_KEYS.Files.Get(fileName),
		async () => {
			const response = await axios.get(
				`${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/${fileName}`
			);

			return response.data;
		},
		{
			enabled: isAppReady,
		}
	);
};

export default useGetFile;
