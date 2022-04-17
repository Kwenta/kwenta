import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const useENS = (address?: string): { ensName: string | null; ensAvatar: string | null } => {
	const [ensName, setENSName] = useState<string | null>(null);
	const [ensAvatar, setENSAvatar] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		(async () => {
			if (address && ethers.utils.isAddress(address)) {
				const provider = ethers.providers.getDefaultProvider();
				const name = await provider.lookupAddress(address);
				if (name && mounted) {
					const avatar = await provider.getAvatar(name);
					setENSAvatar(avatar);
					setENSName(name);
				}
			}
		})();

		return () => {
			mounted = false;
		};
	}, [address]);

	return { ensName, ensAvatar };
};

export default useENS;
