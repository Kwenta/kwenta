import { useEffect, useState } from 'react';

import Connector from 'containers/Connector';

const useENS = (address?: string): { ensName: string | null; ensAvatar: string | null } => {
	const [ensName, setENSName] = useState<string | null>(null);
	const [ensAvatar, setENSAvatar] = useState<string | null>(null);
	const { staticMainnetProvider } = Connector.useContainer();

	useEffect(() => {
		let mounted = true;

		(async () => {
			if (address) {
				const name = await staticMainnetProvider.lookupAddress(address);
				if (name && mounted) {
					const avatar = await staticMainnetProvider.getAvatar(name);
					setENSAvatar(avatar);
					setENSName(name);
				}
			}
		})();

		return () => {
			mounted = false;
			setENSAvatar(null);
			setENSName(null);
		};
	}, [address, staticMainnetProvider]);

	return { ensName, ensAvatar };
};

export default useENS;
