import axios from 'axios';
import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from './constants';

const useGetFiles = (fileNames: string[]) => {
	const client = axios.create({
		baseURL: `${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`,
		timeout: 5000,
	});
	return useQuery(QUERY_KEYS.Files.GetMultiple(fileNames), async () => {
		let responses: any[] = [];
		fileNames.forEach(async (fileName) => {
			const response = await client.get(fileName);
			responses.push(response.data ?? null);
		});
		return responses;
	});
};

export default useGetFiles;
