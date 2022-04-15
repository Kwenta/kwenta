import detectEthereumProvider from '@metamask/detect-provider';
import { NetworkId } from '@synthetixio/contracts-interface';
import { GasPrice } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import {
	ETH_UNIT,
	GWEI_UNIT,
	GWEI_DECIMALS,
	GasLimitEstimate,
	SUPPORTED_NETWORKS,
} from 'constants/network';

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

export const getTotalGasPrice = (gasPriceObj?: GasPrice | null) => {
	if (!gasPriceObj) return wei(0);
	const { gasPrice, baseFeePerGas, maxPriorityFeePerGas } = gasPriceObj;
	if (gasPrice) {
		return wei(gasPrice, GWEI_DECIMALS);
	}
	return wei(baseFeePerGas || 0, GWEI_DECIMALS).add(wei(maxPriorityFeePerGas || 0, GWEI_DECIMALS));
};

export const newGetTransactionPrice = (
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

export const getIsOVM = (networkId: number): boolean => !!~[10, 69].indexOf(networkId);
