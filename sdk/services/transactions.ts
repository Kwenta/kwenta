import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { omit, clone } from 'lodash';
import KwentaSDK from 'sdk';

import * as sdkErrors from '../common/errors';
import { ContractName } from '../contracts';

const OVMGasPriceOracle = getContractFactory('OVM_GasPriceOracle').attach(
	predeploys.OVM_GasPriceOracle
);

const contractAbi = JSON.parse(
	// @ts-ignore
	OVMGasPriceOracle.interface.format(ethers.utils.FormatTypes.json)
);

const DEFAULT_GAS_BUFFER = 0.2;

export default class TransactionsService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public createContractTxn(
		contract: ethers.Contract,
		method: string,
		args: any[],
		txnOptions: Partial<ethers.providers.TransactionRequest> = {},
		options?: { gasLimitBuffer?: number }
	) {
		const txn = {
			to: contract.address,
			data: contract.interface.encodeFunctionData(method, args),
			value: ethers.BigNumber.from(0),
			...txnOptions,
		};

		return this.createEVMTxn(txn, options);
	}

	public async createEVMTxn(txn: ethers.providers.TransactionRequest, options?: any) {
		const execTxn = clone(txn);

		if (!execTxn.gasLimit) {
			const newGasLimit = await this.estimateGas(execTxn);
			execTxn.gasLimit = wei(newGasLimit ?? 0, 9)
				.mul(1 + (options?.gasLimitBuffer || DEFAULT_GAS_BUFFER))
				.toBN();
		}

		const txnData = await this.sdk.context.signer.sendTransaction(execTxn);

		return txnData;
	}

	public createSynthetixTxn(
		contractName: ContractName,
		method: string,
		args: any[],
		txnOptions: Partial<ethers.providers.TransactionRequest> = {},
		options?: any
	) {
		const contract = this.sdk.context.contracts[contractName];

		if (!contract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.createContractTxn(contract, method, args, txnOptions, options);
	}

	public async estimateGas(txn: ethers.providers.TransactionRequest) {
		return this.sdk.context.signer.estimateGas(
			omit(txn, ['gasPrice', 'maxPriorityFeePerGas', 'maxFeePerGas'])
		);
	}

	public async getOptimismLayerOneFees(txn?: ethers.providers.TransactionRequest) {
		if (!txn || !this.sdk.context.signer) return null;

		const isNotOvm =
			this.sdk.context.networkId !== NetworkIdByName['mainnet-ovm'] &&
			this.sdk.context.networkId !== NetworkIdByName['kovan-ovm'] &&
			this.sdk.context.networkId !== NetworkIdByName['goerli-ovm'];

		if (isNotOvm) {
			return null;
		}

		const OptimismGasPriceOracleContract = new ethers.Contract(
			OVMGasPriceOracle.address,
			contractAbi,
			this.sdk.context.signer
		);

		const cleanedTxn = omit(txn, ['from', 'maxPriorityFeePerGas', 'maxFeePerGas']);
		const serializedTxn = ethers.utils.serializeTransaction(
			cleanedTxn as ethers.UnsignedTransaction
		);

		return wei(await OptimismGasPriceOracleContract.getL1Fee(serializedTxn));
	}
}
