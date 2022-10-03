import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import logError from 'utils/logError';

import { ContractMap, getContractsByNetwork } from './contracts';
import ExchangeService from './exchange';
import FuturesService from './futures';
import SynthsService from './synths';

export default class KwentaSDK {
	private provider: ethers.providers.Provider;
	private multicallProvider = new EthCallProvider();
	// private networkId: NetworkId;

	private contracts: ContractMap;
	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;

	constructor(networkId: NetworkId, provider: ethers.providers.Provider) {
		// this.networkId = networkId;
		this.provider = provider;
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);

		this.exchange = new ExchangeService(networkId, this.contracts, this.multicallProvider);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this.contracts);
	}

	public setProvider(provider: ethers.providers.Provider) {
		this.provider = provider;
	}

	public setNetworkId(networkId: NetworkId) {
		// this.networkId = networkId;
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);

		this.exchange = new ExchangeService(networkId, this.contracts, this.multicallProvider);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this.contracts);
	}

	public async getWalletTrades(walletAddress: string) {
		logError(walletAddress);
	}

	public async getExchangeRates() {}
}
