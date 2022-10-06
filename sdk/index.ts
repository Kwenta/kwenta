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
	private signer?: ethers.Signer;
	private multicallProvider = new EthCallProvider();
	private walletAddress?: string;

	private contracts: ContractMap;
	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;

	constructor(
		networkId: NetworkId,
		provider: ethers.providers.Provider,
		signer?: ethers.Signer,
		walletAddress?: string
	) {
		this.provider = provider;
		this.signer = signer;
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);
		this.walletAddress = walletAddress;

		this.exchange = new ExchangeService(
			networkId,
			this.provider,
			this.contracts,
			this.multicallProvider,
			this.signer,
			this.walletAddress
		);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this.contracts);
	}

	public setProvider(provider: ethers.providers.Provider) {
		this.provider = provider;
	}

	public setSigner(signer: ethers.Signer) {
		this.signer = signer;
	}

	public setNetworkId(networkId: NetworkId) {
		this.multicallProvider.init(this.provider);
		this.contracts = getContractsByNetwork(networkId);

		this.exchange = new ExchangeService(
			networkId,
			this.provider,
			this.contracts,
			this.multicallProvider,
			this.signer,
			this.walletAddress
		);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this.contracts);
	}

	public setWalletAddress(walletAddress: string) {
		this.walletAddress = walletAddress;
	}

	public async getWalletTrades(walletAddress: string) {
		logError(walletAddress);
	}

	public async getExchangeRates() {}
}
