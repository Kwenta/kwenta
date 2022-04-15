import { BigNumber } from 'ethers';

export const GWEI_UNIT = 1000000000;
export const GWEI_DECIMALS = 9;
export const ETH_UNIT = 1000000000000000000;

export type GasLimitEstimate = BigNumber | null;

export const SUPPORTED_NETWORKS = [
	1, // Ethereum (mainnet)
	10, // Optimism (mainnet)
	42, // Ethereum Kovan (testnet)
	69, // Optimism Kovan (tesnet)
];
