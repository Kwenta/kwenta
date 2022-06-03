import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';

const useENSAvatar = (provider: any, ensName: string, options?: UseQueryOptions<any | null>) => {
	return useQuery<string | null>(
		QUERY_KEYS.Network.ENSAvatar(ensName),
		async () => {
			const avatar = ensName.endsWith('.eth') ? await provider.getAvatar(ensName) : null;
			return avatar;
		},
		{
			...options,
		}
	);
};

export default useENSAvatar;
