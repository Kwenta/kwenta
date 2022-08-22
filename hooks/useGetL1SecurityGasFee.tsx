import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import Wei from '@synthetixio/wei';
import { BytesLike, ethers } from 'ethers';
import { omit } from 'lodash';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { isL2State } from 'store/wallet';
import { weiFromWei, zeroBN } from 'utils/formatters/number';

type MetaTx = {
	data?: BytesLike | undefined;
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

	return async (metaTx: MetaTx): Promise<Wei> => {
		if (!isL2) return zeroBN;

		if (!signer) return Promise.reject('Wallet not connected');
		const contract = new ethers.Contract(OVMGasPriceOracle.address, contractAbi, signer);
		const nonce = await signer.getTransactionCount();
		const chainId = await signer.getChainId();
		const txParams = {
			...omit(metaTx, 'from'),
			nonce: nonce,
			chainId: Number(chainId) || 1,
			value: 0,
		};
		const serializedTx = ethers.utils.serializeTransaction(txParams);
		const gasFee = await contract.functions.getL1Fee(serializedTx);

		return weiFromWei(gasFee.toString());
	};
};
