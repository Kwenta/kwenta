import detectEthereumProvider from '@metamask/detect-provider';
import { NetworkId } from '@synthetixio/contracts-interface';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { ETH_UNIT, GWEI_UNIT } from 'constants/network';

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

export type GasInfo = {
	limit: number;
	l1Fee: number;
};

export const getTransactionPrice = (
	gasPrice: number | null,
	gasLimit: number | null | undefined,
	ethPrice: number | null,
	l1SecurityFeeWei: number = 0
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null;
	const gasFeeEth = (gasLimit * gasPrice) / GWEI_UNIT;
	const l1FeeEth = l1SecurityFeeWei / ETH_UNIT;
	return (gasFeeEth + l1FeeEth) * ethPrice;
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const gasPriceInWei = (gasPrice: number) => Math.ceil(gasPrice * GWEI_UNIT); // 🤔 sometimes a float on kovan

export const getIsOVM = (networkId: number): boolean => !!~[10, 69].indexOf(networkId);
