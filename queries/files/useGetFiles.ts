import axios from 'axios';
import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from './constants';

const client = axios.create({
	baseURL: `${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`,
	timeout: 5000,
});

const useGetFiles = (periods: number[]) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const fileNames = periods
		.slice(0, -1)
		.map((i) => `trading-rewards-snapshots/${network.id === 420 ? `goerli-` : ''}epoch-${i}.json`);

	return useQuery(
		QUERY_KEYS.Files.GetMultiple(fileNames),
		async () => {
			if (!isL2) return null;
			let responses: any[] = [];
			for (const fileName of fileNames) {
				const response = await client.get(fileName);
				responses.push(response.data ?? null);
			}
			return responses;
		},
		{
			enabled: isL2,
		}
	);
};

export default useGetFiles;
