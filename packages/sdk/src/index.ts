import { ethers } from 'ethers'

import Context, { IContext } from './context'
import ExchangeService from './services/exchange'
import FuturesService from './services/futures'
import KwentaTokenService from './services/kwentaToken'
import PricesService from './services/prices'
import SynthsService from './services/synths'
import SystemService from './services/system'
import TransactionsService from './services/transactions'
import StatsService from './services/stats'

export default class KwentaSDK {
	public context: Context

	public exchange: ExchangeService
	public futures: FuturesService
	public synths: SynthsService
	public transactions: TransactionsService
	public kwentaToken: KwentaTokenService
	public prices: PricesService
	public stats: StatsService
	public system: SystemService

	constructor(context: IContext) {
		this.context = new Context(context)
		this.exchange = new ExchangeService(this)
		this.futures = new FuturesService(this)
		this.prices = new PricesService(this)
		this.synths = new SynthsService(this)
		this.transactions = new TransactionsService(this)
		this.kwentaToken = new KwentaTokenService(this)
		this.stats = new StatsService(this)
		this.system = new SystemService(this)
	}

	public setProvider(provider: ethers.providers.Provider) {
		return this.context.setProvider(provider)
	}

	public setSigner(signer: ethers.Signer) {
		return this.context.setSigner(signer)
	}
}
