import { BigNumber } from 'ethers';

export const GWEI_UNIT = 1000000000;
export const GWEI_DECIMALS = 9;
export const ETH_UNIT = 1000000000000000000;

export type GasLimitEstimate = BigNumber | null;

export const SUPPORTED_NETWORKS = [
	1, // Ethereum (mainnet)
	10, // Optimism (mainnet)
	42, // Ethereum Kovan (testnet)
	69, // Optimism Kovan (testnet)
	420, // Optimism Goerli (testnet)
];

export enum BlastNetwork {
	ETHEREUM_MAINNET = 'eth-mainnet',
	OPTIMISM_MAINNET = 'optimism-mainnet',
	ETHEREUM_KOVAN = 'eth-kovan',
}

export const BLAST_NETWORK_LOOKUP: Record<number, BlastNetwork> = {
	1: BlastNetwork.ETHEREUM_MAINNET,
	10: BlastNetwork.OPTIMISM_MAINNET,
	42: BlastNetwork.ETHEREUM_KOVAN,
};
