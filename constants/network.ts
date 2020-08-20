export type NetworkId = 1 | 3 | 4 | 42;

export const GWEI_UNIT = 1000000000;

export const SUPPORTED_NETWORKS: Record<NetworkId, string> = {
	1: 'MAINNET',
	3: 'ROPSTEN',
	4: 'RINKEBY',
	42: 'KOVAN',
};

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
export const INFURA_JSON_RPC_URLS: Record<NetworkId, string> = {
	1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
	3: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
	4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
	42: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
};

export const DEFAULT_NETWORK_ID: NetworkId = 1;
