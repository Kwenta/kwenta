import { NetworkId } from '@synthetixio/contracts-interface';

import logError from 'utils/logError';

import { getContractsByNetwork } from './contracts';
import ExchangeService from './exchange';
import FuturesService from './futures';
import SynthsService from './synths';

export default class KwentaSDK {
	private provider: any;
	private networkId: NetworkId;

	private contracts: ReturnType<typeof getContractsByNetwork>;
	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;

	constructor(networkId: NetworkId) {
		this.networkId = networkId;
		this.contracts = getContractsByNetwork(networkId);
		this.exchange = new ExchangeService(networkId);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(networkId, this.contracts);
	}

	public setNetworkId(networkId: NetworkId) {
		this.networkId = networkId;
		this.contracts = getContractsByNetwork(networkId);
		this.exchange = new ExchangeService(networkId);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(networkId, this.contracts);
	}

	public async getWalletTrades(walletAddress: string) {
		logError(walletAddress);
	}

	public async getExchangeRates() {}
}
