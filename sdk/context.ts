import { EventEmitter } from 'events';

import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import * as sdkErrors from './common/errors';
import {
	ContractsMap,
	MulticallContractsMap,
	getContractsByNetwork,
	getMulticallContractsByNetwork,
} from './contracts';

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
	public multicallContracts: MulticallContractsMap;
	public events = new EventEmitter().setMaxListeners(100);

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context };

		if (context.provider) {
			this.multicallProvider.init(context.provider);
		}

		if (context.signer) {
			this.setSigner(context.signer);
		}

		this.contracts = getContractsByNetwork(context.networkId, context.provider);
		this.multicallContracts = getMulticallContractsByNetwork(context.networkId);
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

	get isMainnet() {
		return [1, 10].includes(this.networkId);
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
		this.contracts = getContractsByNetwork(networkId, this.provider);
		this.multicallContracts = getMulticallContractsByNetwork(networkId);
		this.events.emit('network_changed', { networkId: networkId });
	}

	public async setSigner(signer: ethers.Signer) {
		this.context.walletAddress = await signer.getAddress();
		this.context.signer = signer;
	}
}
