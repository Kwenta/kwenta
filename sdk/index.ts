import { EventEmitter } from 'events';

import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import { ContractMap, getContractsByNetwork } from './contracts';
import ExchangeService from './exchange';
import FuturesService from './futures';
import SynthsService from './synths';

export default class KwentaSDK {
	public provider: ethers.providers.Provider;
	public signer?: ethers.Signer;
	public multicallProvider = new EthCallProvider();
	public walletAddress?: string;

	public contracts: ContractMap;
	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;
	public events: EventEmitter;

	constructor(networkId: NetworkId, provider: ethers.providers.Provider, signer?: ethers.Signer) {
		this.provider = provider;
		this.signer = signer;
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);
		this.events = new EventEmitter().setMaxListeners(100);

		if (signer) {
			this.setSigner(signer);
		}

		this.exchange = new ExchangeService(this, networkId);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this);
	}

	public setProvider(provider: ethers.providers.Provider) {
		this.provider = provider;
	}

	public async setSigner(signer: ethers.Signer) {
		this.signer = signer;
		this.walletAddress = await signer.getAddress();
		this.events.emit('signer_connected');
	}

	public async setNetworkId(networkId: NetworkId) {
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);

		this.exchange = new ExchangeService(this, networkId);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this);
	}
}
