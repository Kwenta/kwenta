import { EventEmitter } from 'events';

import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';

import { ContractMap, ContractName, getContractsByNetwork } from './contracts';
import ExchangeService from './services/exchange';
import FuturesService from './services/futures';
import SynthsService from './services/synths';
import TransactionsService from './services/transactions';

export default class KwentaSDK {
	public provider: ethers.providers.Provider;
	public signer?: ethers.Signer;
	public multicallProvider = new EthCallProvider();
	public walletAddress?: string;
	public networkId: NetworkId;

	public contracts: ContractMap;
	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;
	public transactions: TransactionsService;

	public events: EventEmitter;

	constructor(networkId: NetworkId, provider: ethers.providers.Provider, signer?: ethers.Signer) {
		this.networkId = networkId;
		this.provider = provider;
		this.signer = signer;
		this.multicallProvider.init(this.provider);
		this.contracts = this.getContracts();
		this.events = new EventEmitter().setMaxListeners(100);

		if (signer) {
			this.setSigner(signer);
		}

		this.exchange = new ExchangeService(this);
		this.futures = new FuturesService(networkId);
		this.synths = new SynthsService(this);
		this.transactions = new TransactionsService(this);
	}

	public setProvider(provider: ethers.providers.Provider) {
		this.provider = provider;
		this.multicallProvider.init(provider);
		this.contracts = this.getContracts();
	}

	public async setSigner(signer: ethers.Signer) {
		this.signer = signer;
		this.walletAddress = await signer.getAddress();
	}

	public async setNetworkId(networkId: NetworkId) {
		this.networkId = networkId;
		await this.exchange.getOneInchTokens();
		this.contracts = getContractsByNetwork(networkId);
	}

	private getContracts() {
		const contracts = getContractsByNetwork(this.networkId);

		return Object.entries(contracts).reduce((acc, [contractName, contract]) => {
			acc[contractName as ContractName] = contract.connect(this.provider);

			return acc;
		}, {} as ContractMap);
	}
}
