import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { omit, clone } from 'lodash';
import KwentaSDK from 'sdk';

import { ContractName } from './contracts';

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
		options?: any
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
		if (!this.sdk.signer) {
			throw new Error('A signer is required to execute a transaction.');
		}

		const execTxn = clone(txn);

		if (!execTxn.gasLimit) {
			const newGasLimit = await this.estimateGas(execTxn);
			execTxn.gasLimit = wei(newGasLimit ?? 0, 9)
				.mul(1 + (options?.gasLimitBuffer || DEFAULT_GAS_BUFFER))
				.toBN();
		}

		const txnData = await this.sdk.signer.sendTransaction(execTxn);

		return txnData;
	}

	public createSynthetixTxn(
		contractName: ContractName,
		method: string,
		args: any[],
		txnOptions: Partial<ethers.providers.TransactionRequest> = {},
		options?: any
	) {
		const contract = this.sdk.contracts[contractName];

		if (!contract) {
			throw new Error('The selected contract does not exist on this network.');
		}

		return this.createContractTxn(contract, method, args, txnOptions, options);
	}

	private async estimateGas(txn: ethers.providers.TransactionRequest) {
		if (!this.sdk.signer) {
			throw new Error('A signer is required to estimate gas.');
		}

		return this.sdk.signer.estimateGas(
			omit(txn, ['gasPrice', 'maxPriorityFeePerGas', 'maxFeePerGas'])
		);
	}

	public async getOptimismLayerOneFees(txn?: ethers.providers.TransactionRequest) {
		if (!txn || !this.sdk.provider) return null;

		const isNotOvm =
			this.sdk.networkId !== NetworkIdByName['mainnet-ovm'] &&
			this.sdk.networkId !== NetworkIdByName['kovan-ovm'] &&
			this.sdk.networkId !== NetworkIdByName['goerli-ovm'];

		if (isNotOvm) {
			return null;
		}

		const OptimismGasPriceOracleContract = new ethers.Contract(
			OVMGasPriceOracle.address,
			contractAbi,
			this.sdk.provider
		);

		const cleanedTxn = omit(txn, ['maxPriorityFeePerGas', 'maxFeePerGas']);
		const serializedTxn = ethers.utils.serializeTransaction(
			cleanedTxn as ethers.UnsignedTransaction
		);

		return wei(await OptimismGasPriceOracleContract.getL1Fee(serializedTxn));
	}
}
