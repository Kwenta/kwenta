import { OPTIMISM_NETWORKS } from '@synthetixio/optimism-networks';

import { NetworkId, NetworkNameById, NetworkIdByName } from 'sdk/types/common';

export const getBaseUrl = (networkId: NetworkId) => {
	if (networkId === 10 || networkId === 420) {
		return OPTIMISM_NETWORKS[networkId as NetworkId]?.blockExplorerUrls[0];
	} else if (networkId === NetworkIdByName.mainnet) {
		return 'https://etherscan.io';
	}
	return `https://${NetworkNameById[networkId]}.etherscan.io`;
};

export const generateExplorerFunctions = (baseUrl: string) => ({
	baseLink: baseUrl,
	txLink: (txId: string) => `${baseUrl}/tx/${txId}`,
	addressLink: (address: string) => `${baseUrl}/address/${address}`,
	tokenLink: (address: string) => `${baseUrl}/token/${address}`,
	blockLink: (blockNumber: string) => `${baseUrl}/block/${blockNumber}`,
});
