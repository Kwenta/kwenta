import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { OPTIMISM_NETWORKS, MAINNET_OPTIMISM_EXPLORER } from '@synthetixio/optimism-networks';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { createContainer } from 'unstated-next';

import { Network } from 'store/wallet';
import { networkState } from 'store/wallet';

type BlockExplorerInstance = {
	baseLink: string;
	txLink: (txId: string) => string;
	addressLink: (address: string) => string;
	tokenLink: (address: string) => string;
	blockLink: (blockNumber: string) => string;
};

const getBaseUrl = (network: Network) => {
	if (network.useOvm) {
		return OPTIMISM_NETWORKS[network.id]?.blockExplorerUrls[0] ?? MAINNET_OPTIMISM_EXPLORER;
	} else if (network.id === NetworkIdByName.mainnet) {
		return 'https://etherscan.io';
	}
	return `https://${network.name}.etherscan.io`;
};

const generateExplorerFunctions = (baseUrl: string) => {
	return {
		baseLink: baseUrl,
		txLink: (txId: string) => `${baseUrl}/tx/${txId}`,
		addressLink: (address: string) => `${baseUrl}/address/${address}`,
		tokenLink: (address: string) => `${baseUrl}/token/${address}`,
		blockLink: (blockNumber: string) => `${baseUrl}/block/${blockNumber}`,
	};
};

const useBlockExplorer = () => {
	const network = useRecoilValue(networkState);

	const [blockExplorerInstance, setBlockExplorerInstance] = useState<BlockExplorerInstance | null>(
		null
	);

	useEffect(() => {
		if (network) {
			const baseUrl = getBaseUrl(network);
			setBlockExplorerInstance(generateExplorerFunctions(baseUrl));
		}
	}, [network]);

	return {
		blockExplorerInstance,
	};
};

const BlockExplorer = createContainer(useBlockExplorer);

export default BlockExplorer;
