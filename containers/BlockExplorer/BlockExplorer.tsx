import { NetworkId, NetworkIdByName, NetworkNameById } from '@synthetixio/contracts-interface';
import { OPTIMISM_NETWORKS } from '@synthetixio/optimism-networks';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useNetwork } from 'wagmi';

type BlockExplorerInstance = {
	baseLink: string;
	txLink: (txId: string) => string;
	addressLink: (address: string) => string;
	tokenLink: (address: string) => string;
	blockLink: (blockNumber: string) => string;
};

const getBaseUrl = (networkId: NetworkId) => {
	if (networkId === 10 || networkId === 420) {
		return (
			OPTIMISM_NETWORKS[networkId as NetworkId]?.blockExplorerUrls[0] ??
			OPTIMISM_NETWORKS[10]?.blockExplorerUrls[0]
		);
	} else if ((networkId as NetworkId) === NetworkIdByName.mainnet) {
		return 'https://etherscan.io';
	}
	return `https://${NetworkNameById[networkId]}.etherscan.io`;
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
	const { chain: network } = useNetwork();

	const [blockExplorerInstance, setBlockExplorerInstance] = useState<BlockExplorerInstance | null>(
		null
	);

	useEffect(() => {
		if (network) {
			const baseUrl = getBaseUrl(network?.id as NetworkId);
			setBlockExplorerInstance(generateExplorerFunctions(baseUrl));
		}
	}, [network]);

	return {
		blockExplorerInstance,
	};
};

const BlockExplorer = createContainer(useBlockExplorer);

export default BlockExplorer;
