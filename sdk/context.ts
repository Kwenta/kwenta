import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import * as sdkErrors from './common/errors';
import { ContractName, getContractsByNetwork, ContractMap } from './contracts';

export interface IContext {
	provider: ethers.providers.Provider;
	networkId: NetworkId;
	signer?: ethers.Signer;
	walletAddress?: string;
}

const DEFAULT_CONTEXT: Partial<IContext> = {
	networkId: 10,
};

export default class Context implements IContext {
	private context: IContext;
	public multicallProvider = new EthCallProvider();
	public contracts: ContractMap;

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context };

		if (context.provider) {
			this.multicallProvider.init(context.provider);
		}

		if (context.signer) {
			this.setSigner(context.signer);
		}

		this.contracts = this.getContracts();
	}

	get networkId() {
		return this.context.networkId ?? 10;
	}

	get provider() {
		return this.context.provider;
	}

	get signer() {
		if (!this.context.signer) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		return this.context.signer;
	}

	get walletAddress() {
		if (!this.context.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		return this.context.walletAddress;
	}

	get isL2() {
		return [10, 420].includes(this.networkId);
	}

	get hasWalletAddress() {
		return !!this.walletAddress;
	}

	public async setProvider(provider: ethers.providers.Provider) {
		this.context.provider = provider;
		this.multicallProvider.init(provider);
		const networkId = (await provider.getNetwork()).chainId as NetworkId;
		await this.setNetworkId(networkId);

		return networkId;
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
