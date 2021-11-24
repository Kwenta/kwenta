import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { omit } from 'lodash';

import Connector from 'containers/Connector';
import { EthereumProvider } from '@synthetixio/optimism-networks/build/node/types';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

type MetaTx = {
	data?: string | undefined;
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

export const useGetL1SecurityFee = () => {
	const isL2 = useRecoilValue(isL2State);
	const { signer } = Connector.useContainer();

	return async (metaTx: MetaTx): Promise<number> => {
		if (!isL2) return 0;

		const provider = (await detectEthereumProvider()) as EthereumProvider;
		if (!signer) return Promise.reject('Wallet not connected');
		const contract = new ethers.Contract(OVMGasPriceOracle.address, contractAbi, signer);
		const nonce = await signer.getTransactionCount();
		const txParams = {
			...omit(metaTx, 'from'),
			nonce: nonce,
			chainId: Number(provider?.chainId) || 1,
			value: 0,
		};
		const serializedTx = ethers.utils.serializeTransaction(txParams);
		const gasFee = await contract.functions.getL1Fee(serializedTx);
		return Number(gasFee.toString());
	};
};
