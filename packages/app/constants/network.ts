import { BigNumber } from 'ethers';

export const GWEI_UNIT = 1000000000;
export const GWEI_DECIMALS = 9;
export const ETH_UNIT = 1000000000000000000;
export const STALL_TIMEOUT = 5000;
export type GasLimitEstimate = BigNumber | null;

export const SUPPORTED_NETWORKS = [
	1, // Ethereum (mainnet)
	5, // Goerli (testnet)
	10, // Optimism (mainnet)
	420, // Optimism Goerli (testnet)
];

export enum BlastNetwork {
	ETHEREUM_MAINNET = 'eth-mainnet',
	OPTIMISM_MAINNET = 'optimism-mainnet',
	ETHEREUM_GOERLI = 'eth-goerli',
	OPTIMISM_GOERLI = 'optimism-goerli',
}

export const BLAST_NETWORK_LOOKUP: Record<number, BlastNetwork> = {
	1: BlastNetwork.ETHEREUM_MAINNET,
	5: BlastNetwork.ETHEREUM_GOERLI,
	10: BlastNetwork.OPTIMISM_MAINNET,
	420: BlastNetwork.OPTIMISM_GOERLI,
};
