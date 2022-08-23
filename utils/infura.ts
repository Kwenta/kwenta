import { NetworkId } from '@synthetixio/contracts-interface';

export const GWEI_UNIT = 1000000000;

export const INFURA_SUPPORTED_NETWORKS: Record<NetworkId, string> = {
	1: 'mainnet',
	5: 'goerli',
	10: 'optimism-mainnet',
	42: 'kovan',
	69: 'optimism-kovan',
	420: 'goerli-ovm',
	31337: 'mainnet-fork',
};

export const getInfuraRpcURL = (networkId: NetworkId) => {
	return `https://${INFURA_SUPPORTED_NETWORKS[networkId]}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`;
};
