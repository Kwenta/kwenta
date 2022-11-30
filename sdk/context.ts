import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import * as sdkErrors from './common/errors';
import { ContractsMap, getContractsByNetwork } from './contracts';

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
	public contracts: ContractsMap;

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context };

		if (context.provider) {
			this.multicallProvider.init(context.provider);
		}

		if (context.signer) {
			this.setSigner(context.signer);
		}

		this.contracts = getContractsByNetwork(context.networkId, context.signer ?? context.provider);
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

	public async setProvider(provider: ethers.providers.Provider) {
		this.context.provider = provider;
		this.multicallProvider.init(provider);
		const networkId = (await provider.getNetwork()).chainId as NetworkId;
		this.setNetworkId(networkId);

		return networkId;
	}

	public setNetworkId(networkId: NetworkId) {
		this.context.networkId = networkId;
		this.contracts = getContractsByNetwork(networkId, this.context.signer ?? this.provider);
	}

	public async setSigner(signer: ethers.Signer) {
		this.context.walletAddress = await signer.getAddress();
		this.context.signer = signer;
		// Reinit contracts with signer when connected
		this.contracts = getContractsByNetwork(this.networkId, signer);
	}
}
