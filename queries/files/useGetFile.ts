import axios from 'axios';
import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from 'sdk/constants/files';

const useGetFile = (fileName: string) => {
	return useQuery(QUERY_KEYS.Files.Get(fileName), async () => {
		const response = await axios.get(`${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/${fileName}`);
		return response.data;
	});
};

export default useGetFile;
