import detectEthereumProvider from '@metamask/detect-provider';
import { NetworkId } from '@synthetixio/js';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { GWEI_UNIT } from 'constants/network';

type EthereumProvider = {
	isMetaMask: boolean;
	networkVersion: string;
};

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		const provider = (await detectEthereumProvider()) as EthereumProvider;
		if (provider) {
			return Number(provider.networkVersion);
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

export const gasPriceInWei = (gasPrice: number) => gasPrice * GWEI_UNIT;
