import { ethers, providers } from 'ethers';

import { SUPPORTED_NETWORKS, BLAST_NETWORK_LOOKUP } from 'constants/network';
import { NetworkId } from 'sdk/types/common';

export const staticMainnetProvider = new ethers.providers.InfuraProvider();

export function isSupportedNetworkId(id: NetworkId): boolean {
	return SUPPORTED_NETWORKS.includes(id);
}

const loadInfuraProvider = (networkId: NetworkId) => {
	if (!process.env.NEXT_PUBLIC_INFURA_PROJECT_ID) {
		throw new Error('You must define NEXT_PUBLIC_INFURA_PROJECT_ID in your environment');
	}

	return new ethers.providers.InfuraProvider(networkId, process.env.NEXT_PUBLIC_INFURA_PROJECT_ID);
};

const loadBlastProvider = (networkId: NetworkId) => {
	if (!process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID) {
		throw new Error('You must define NEXT_PUBLIC_BLASTAPI_PROJECT_ID in your environment');
	}

	const networkSlug = BLAST_NETWORK_LOOKUP[networkId];
	if (!networkSlug) {
		return loadInfuraProvider(networkId);
	} else {
		const networkUrl = `https://${networkSlug}.blastapi.io/${process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID}/`;
		return new providers.JsonRpcProvider(networkUrl, networkId);
	}
};

export const getDefaultProvider = (networkId: NetworkId) => {
	const providerId = process.env.NEXT_PUBLIC_PROVIDER_ID;

	let ethersProvider;
	switch (providerId) {
		case 'BLAST_API':
			ethersProvider = loadBlastProvider(networkId);
			break;
		case 'INFURA':
			ethersProvider = loadInfuraProvider(networkId);
			break;
		default:
			throw new Error('You must define NEXT_PUBLIC_PROVIDER_ID in your environment');
	}
	return ethersProvider;
};
