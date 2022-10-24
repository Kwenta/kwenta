import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';

import Connector from 'containers/Connector';

type ENSAccount = { ensAddress: string | null; ensName: string | null; ensAvatar: string | null };

const useENS = (addressOrName: string): ENSAccount => {
	const [ensAddress, setENSAddress] = useState<string | null>(null);
	const [ensName, setENSName] = useState<string | null>(null);
	const [ensAvatar, setENSAvatar] = useState<string | null>(null);
	const { staticMainnetProvider } = Connector.useContainer();

	useEffect(() => {
		let mounted = true;

		(async () => {
			let newEnsName = null;
			if (isAddress(addressOrName)) {
				setENSAddress(addressOrName);
				newEnsName = await staticMainnetProvider.lookupAddress(addressOrName);
				setENSName(newEnsName);
			} else if (addressOrName.endsWith('.eth')) {
				newEnsName = await staticMainnetProvider.resolveName(addressOrName);
				setENSAddress(newEnsName);
				setENSName(addressOrName);
			}

			if (newEnsName && mounted) {
				setENSAvatar(await staticMainnetProvider.getAvatar(newEnsName));
			}
		})();

		return () => {
			mounted = false;
			setENSAddress(null);
			setENSAvatar(null);
			setENSName(null);
		};
	}, [addressOrName, staticMainnetProvider]);

	return { ensAddress, ensName, ensAvatar };
};

export default useENS;
