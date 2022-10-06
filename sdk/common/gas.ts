// Some of this file is copied from:
// https://github.com/Synthetixio/js-monorepo/blob/master/packages/queries/src/queries/network/useEthGasPriceQuery.ts

import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import { wei } from '@synthetixio/wei';
import { ethers, BigNumber } from 'ethers';
import { omit } from 'lodash';

import { weiFromWei, zeroBN } from 'utils/formatters/number';

const MULTIPLIER = wei(2);

export const computeGasFee = (
	baseFeePerGas: BigNumber,
	maxPriorityFeePerGas: number
): {
	maxPriorityFeePerGas: BigNumber;
	maxFeePerGas: BigNumber;
	baseFeePerGas: BigNumber;
} => ({
	maxPriorityFeePerGas: wei(maxPriorityFeePerGas, 9).toBN(),
	maxFeePerGas: wei(baseFeePerGas, 9).mul(MULTIPLIER).add(wei(maxPriorityFeePerGas, 9)).toBN(),
	baseFeePerGas: baseFeePerGas,
});

export const getGasPriceFromProvider = async (provider: ethers.providers.Provider) => {
	try {
		const gasPrice = await provider.getGasPrice();
		return {
			fastest: { gasPrice },
			fast: { gasPrice },
			average: { gasPrice },
		};
	} catch (e) {
		throw new Error('Could not retrieve gas price from provider');
	}
};

export type MetaTx = {
	data?: ethers.BytesLike | undefined;
	to?: string | undefined;
	gasLimit: number;
	gasPrice: number;
};

const OVMGasPriceOracle = getContractFactory('OVM_GasPriceOracle').attach(
	predeploys.OVM_GasPriceOracle
);

const contractAbi = JSON.parse(
	// @ts-ignore
	OVMGasPriceOracle.interface.format(ethers.utils.FormatTypes.json)
);

export const getL1SecurityFee = async (isL2: boolean, metaTx: MetaTx, signer?: ethers.Signer) => {
	if (!signer) return Promise.reject('Wallet not connected');
	if (!isL2) return zeroBN;

	const contract = new ethers.Contract(OVMGasPriceOracle.address, contractAbi, signer);
	const nonce = await signer.getTransactionCount();
	const chainId = await signer.getChainId();
	const txParams = {
		...omit(metaTx, 'from'),
		nonce,
		chainId: Number(chainId) || 1,
		value: 0,
	};
	const serializedTx = ethers.utils.serializeTransaction(txParams);
	const gasFee = await contract.functions.getL1Fee(serializedTx);

	return weiFromWei(gasFee.toString());
};
