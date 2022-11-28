import { EventEmitter } from 'events';

import { ethers } from 'ethers';

import Context, { IContext } from './context';
import ExchangeService from './services/exchange';
import FuturesService from './services/futures';
import SynthsService from './services/synths';
import TokenService from './services/token';
import TransactionsService from './services/transactions';

export default class KwentaSDK {
	public events = new EventEmitter().setMaxListeners(100);
	public context: Context;

	public exchange: ExchangeService;
	public futures: FuturesService;
	public synths: SynthsService;
	public transactions: TransactionsService;
	public token: TokenService;

	constructor(context: IContext) {
		this.context = new Context(context);
		this.exchange = new ExchangeService(this);
		this.futures = new FuturesService(this);
		this.synths = new SynthsService(this);
		this.transactions = new TransactionsService(this);
		this.token = new TokenService(this);
	}

	public setProvider(provider: ethers.providers.Provider) {
		return this.context.setProvider(provider);
	}

	public setSigner(signer: ethers.Signer) {
		return this.context.setSigner(signer);
	}
}
