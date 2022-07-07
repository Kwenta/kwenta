import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { create } from 'ipfs-http-client';
import QUERY_KEYS from 'constants/queryKeys';
import { IPFS_ENDPOINT } from './constants';

const useIPFSFile = () => {
	const isAppReady = useRecoilValue(appReadyState);
	const ipfs = create({ url: IPFS_ENDPOINT });

	return useQuery(
		['ipfs', 'file'],
		async () => {
			console.log('check check');
			const dirStatus = await ipfs.files.mkdir('/kwenta');
			console.log(dirStatus);
		},
		{
			enabled: isAppReady,
		}
	);
};

export default useIPFSFile;
