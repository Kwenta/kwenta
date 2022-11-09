import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import * as sdkErrors from './common/errors';
import { ContractName, getContractsByNetwork, ContractMap } from './contracts';

export interface IContext {
	provider?: ethers.providers.Provider;
	signer?: ethers.Signer;
	networkId?: NetworkId;
	walletAddress?: string;
}

const DEFAULT_CONTEXT: IContext = {
	networkId: 10,
};

export default class Context implements IContext {
	private context: IContext;
	public multicallProvider = new EthCallProvider();
	public contracts: ContractMap;

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context };
		this.contracts = this.getContracts();
	}

	get networkId() {
		return this.context.networkId ?? 10;
	}

	get provider() {
		if (!this.context.provider) {
			throw new Error(sdkErrors.NO_PROVIDER);
		}

		return this.context.provider;
	}

	get signer() {
		if (!this.context.signer) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		return this.context.signer;
	}

	public async setNetworkId(networkId: NetworkId) {
		this.context.networkId = networkId;
		this.contracts = this.getContracts();
	}

	public async setSigner(signer: ethers.Signer) {
		this.context.walletAddress = await signer.getAddress();
		this.context.signer = signer;
	}

	private getContracts() {
		const contracts = getContractsByNetwork(this.networkId);

		return Object.entries(contracts).reduce((acc, [name, contract]) => {
			acc[name as ContractName] = contract.connect(this.provider);
			return acc;
		}, {} as ContractMap);
	}
}
