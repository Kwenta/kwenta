import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';
import { Contract } from 'ethers';
import { ENS_REVERSE_LOOKUP } from 'constants/address';
import reverseRecordsAbi from 'lib/abis/ReverseRecords.json';
import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

const ADDRESSES_PER_LOOKUP = 1500;

const useENSs = (addresses: string[], options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	const { staticMainnetProvider } = Connector.useContainer();

	return useQuery<string[]>(
		QUERY_KEYS.Network.ENSNames(addresses),
		async () => {
			const ReverseLookup = new Contract(
				ENS_REVERSE_LOOKUP,
				reverseRecordsAbi,
				staticMainnetProvider
			);

			let ensPromises = [];
			for (let i = 0; i < addresses.length; i += ADDRESSES_PER_LOOKUP) {
				const addressesToLookup = addresses.slice(i, i + ADDRESSES_PER_LOOKUP);
				const ensNamesPromise = ReverseLookup.getNames(addressesToLookup);
				ensPromises.push(ensNamesPromise);
			}

			const ensPromiseResult = await Promise.all(ensPromises);
			const ensInfo = ensPromiseResult.flat(1).map((val: string, ind: number) => {
				return val !== '' ? val : addresses[ind];
			});

			return ensInfo;
		},
		{
			enabled: isAppReady && isL2 && addresses.length > 0,
			...options,
		}
	);
};

export default useENSs;
