import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';

type ENSInfo = {
	address: string | null;
	ensName: string | null;
	ensAvatar: string | null;
};

const useENSs = (addresses: string[]): ENSInfo[] | null => {
	const [ensInfo, setEnsInfo] = useState<ENSInfo[] | null>(null);
	const { staticMainnetProvider } = Connector.useContainer();

	useEffect(() => {
		let mounted = true;

		const getEns = async (address: string) => {
			var name;
			var avatar;
			if (address) {
				const name = await staticMainnetProvider.lookupAddress(address);
				if (name && mounted) {
					avatar = await staticMainnetProvider.getAvatar(name);
				}
			}

			return {
				address: address,
				ensName: name,
				ensAvatar: avatar,
			};
		};

		(async () => {
			if (addresses.length > 0) {
				console.log('Addresses: ', addresses);
				const ensPromises = addresses.map((address) => {
					return getEns(address);
				});
				console.log('Promises: ', ensPromises);
				const newEnsInfo = await Promise.all(ensPromises);
				console.log('Info: ', newEnsInfo);
				// setEnsInfo(newEnsInfo ?? null);
			}
		})();

		return () => {
			mounted = false;
			setEnsInfo(null);
		};
	}, [addresses, staticMainnetProvider]);

	return ensInfo;
};

export default useENSs;
