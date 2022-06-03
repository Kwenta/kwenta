import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';

const useENSAvatar = (ensName: string, options?: UseQueryOptions<any | null>) => {
	const { staticMainnetProvider } = Connector.useContainer();

	return useQuery<string | null>(
		QUERY_KEYS.Network.ENSAvatar(ensName),
		async () => {
			const avatar = ensName.endsWith('.eth')
				? await staticMainnetProvider.getAvatar(ensName)
				: null;
			return avatar;
		},
		{
			...options,
		}
	);
};

export default useENSAvatar;
