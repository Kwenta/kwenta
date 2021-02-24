import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { request } from 'graphql-request';

import { appReadyState } from 'store/app';
import synthetix from 'lib/synthetix';
import QUERY_KEYS from 'constants/queryKeys';

import { ShortContract } from './types';
import { shortContractQuery } from './query';
import { mockShortContract } from './mockShorts';
import { formatShortContractData, SHORT_GRAPH_ENDPOINT } from './utils';

const useShortContractDataQuery = (options?: QueryConfig<ShortContract>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const contractAddress = synthetix.js!.contracts.ShortCollateral.address;

	return useQuery<ShortContract>(
		QUERY_KEYS.Collateral.ShortContract(contractAddress ?? ''),
		async () => {
			const response = await request(SHORT_GRAPH_ENDPOINT, shortContractQuery, {
				id: contractAddress,
			});

			return (response?.shortContracts ?? []).length > 0
				? formatShortContractData(response.shortContracts[0])
				: formatShortContractData(mockShortContract);
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useShortContractDataQuery;
