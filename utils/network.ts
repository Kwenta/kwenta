import detectEthereumProvider from '@metamask/detect-provider';
import { NetworkId } from '@synthetixio/contracts-interface';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { GWEI_UNIT } from 'constants/network';

type EthereumProvider = {
	isMetaMask: boolean;
	chainId: string;
};

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		if (window.ethereum) {
			const provider = (await detectEthereumProvider()) as EthereumProvider;
			if (provider && provider.chainId) {
				return Number(provider.chainId);
			}
		}
		return DEFAULT_NETWORK_ID;
	} catch (e) {
		console.log(e);
		return DEFAULT_NETWORK_ID;
	}
}

export const getTransactionPrice = (
	gasPrice: number | null,
	gasLimit: number | null,
	ethPrice: number | null
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null;

	return (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const gasPriceInWei = (gasPrice: number) => Math.ceil(gasPrice * GWEI_UNIT); // 🤔 sometimes a float on kovan

export const getIsOVM = (networkId: number): boolean => !!~[10, 69].indexOf(networkId);
