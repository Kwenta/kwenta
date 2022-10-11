import { Contract } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';

import { ENS_REVERSE_LOOKUP } from 'constants/address';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import reverseRecordsAbi from 'lib/abis/ReverseRecords.json';

const ADDRESSES_PER_LOOKUP = 1500;

type EnsInfo = {
	[account: string]: string;
};

const useENSs = (addresses: string[], options?: UseQueryOptions<any | null>) => {
	const { staticMainnetProvider } = Connector.useContainer();

	return useQuery<EnsInfo>(
		QUERY_KEYS.Network.ENSNames(addresses),
		async () => {
			const ReverseLookup = new Contract(
				ENS_REVERSE_LOOKUP,
				reverseRecordsAbi,
				// @ts-ignore provider type
				staticMainnetProvider
			);

			let ensPromises = [];
			for (let i = 0; i < addresses.length; i += ADDRESSES_PER_LOOKUP) {
				const addressesToLookup = addresses.slice(i, i + ADDRESSES_PER_LOOKUP);
				const ensNamesPromise = ReverseLookup.getNames(addressesToLookup);
				ensPromises.push(ensNamesPromise);
			}

			let ensInfo: EnsInfo = {};

			const ensPromiseResult = await Promise.all(ensPromises);
			ensPromiseResult.flat(1).forEach((val: string, ind: number) => {
				if (val !== '') {
					ensInfo[addresses[ind]] = val;
				}
			});

			return ensInfo;
		},
		{
			enabled: addresses.length > 0,
			...options,
		}
	);
};

export default useENSs;
