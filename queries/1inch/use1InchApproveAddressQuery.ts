import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Convert from 'containers/Convert';

const use1InchApproveAddressQuery = (options?: UseQueryOptions<string | null>) => {
	const { get1InchApproveAddress } = Convert.useContainer();

	return useQuery<string | null>(
		QUERY_KEYS.Convert.approveAddress1Inch,
		async () => {
			const address = await get1InchApproveAddress();

			return address;
		},
		options
	);
};

export default use1InchApproveAddressQuery;
