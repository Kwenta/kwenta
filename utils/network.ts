import detectEthereumProvider from '@metamask/detect-provider';
import { NetworkId } from '@synthetixio/contracts-interface';
import loadProvider from '@synthetixio/providers';
import { GasPrice } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { providers } from 'ethers';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import {
	GWEI_UNIT,
	GWEI_DECIMALS,
	GasLimitEstimate,
	SUPPORTED_NETWORKS,
	BLAST_NETWORK_LOOKUP,
} from 'constants/network';

import logError from './logError';

type EthereumProvider = {
	isMetaMask: boolean;
	chainId: string;
};

export function isSupportedNetworkId(id: NetworkId): boolean {
	return SUPPORTED_NETWORKS.includes(id);
}

export async function getDefaultNetworkId(walletConnected: boolean = true): Promise<NetworkId> {
	try {
		if (walletConnected && window.ethereum) {
			const provider = (await detectEthereumProvider()) as EthereumProvider;
			if (provider && provider.chainId) {
				const id = Number(provider.chainId) as NetworkId;
				return isSupportedNetworkId(id) ? id : DEFAULT_NETWORK_ID;
			}
		}
		return DEFAULT_NETWORK_ID;
	} catch (e) {
		logError(e);
		return DEFAULT_NETWORK_ID;
	}
}

const loadInfuraProvider = (networkId: NetworkId) => {
	if (!process.env.NEXT_PUBLIC_INFURA_PROJECT_ID) {
		throw new Error('You must define NEXT_PUBLIC_INFURA_PROJECT_ID in your environment');
	}

	return loadProvider({
		networkId,
		infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
	});
};

const loadBlastProvider = (networkId: NetworkId) => {
	if (!process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID) {
		throw new Error('You must define NEXT_PUBLIC_BLASTAPI_PROJECT_ID in your environment');
	}

	const networkSlug = BLAST_NETWORK_LOOKUP[networkId];
	const networkUrl = `https://${networkSlug}.blastapi.io/${process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID}/`;
	return new providers.JsonRpcProvider(networkUrl, networkId);
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

export const getTotalGasPrice = (gasPriceObj?: GasPrice | null) => {
	if (!gasPriceObj) return wei(0);
	const { gasPrice, baseFeePerGas, maxPriorityFeePerGas } = gasPriceObj;
	if (gasPrice) {
		return wei(gasPrice, GWEI_DECIMALS);
	}
	return wei(baseFeePerGas || 0, GWEI_DECIMALS).add(wei(maxPriorityFeePerGas || 0, GWEI_DECIMALS));
};

export const getTransactionPrice = (
	gasPrice: GasPrice | null,
	gasLimit: GasLimitEstimate,
	ethPrice: Wei | null,
	optimismLayerOneFee: Wei | null
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null;
	const totalGasPrice = getTotalGasPrice(gasPrice);
	const extraLayer1Fees = optimismLayerOneFee;
	const gasPriceCost = totalGasPrice.mul(wei(gasLimit, GWEI_DECIMALS)).mul(ethPrice);
	const l1Cost = ethPrice.mul(extraLayer1Fees || 0);
	const txPrice = gasPriceCost.add(l1Cost);
	return txPrice;
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const gasPriceInWei = (gasPrice: number) => Math.ceil(gasPrice * GWEI_UNIT); // 🤔 sometimes a float on kovan

export const getIsOVM = (networkId: number): boolean => [10, 69, 420].includes(networkId);
