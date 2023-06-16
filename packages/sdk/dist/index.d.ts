import { ethers } from 'ethers';
import Context, { IContext } from './context';
import ExchangeService from './services/exchange';
import FuturesService from './services/futures';
import KwentaTokenService from './services/kwentaToken';
import PricesService from './services/prices';
import SynthsService from './services/synths';
import SystemService from './services/system';
import TransactionsService from './services/transactions';
export default class KwentaSDK {
    context: Context;
    exchange: ExchangeService;
    futures: FuturesService;
    synths: SynthsService;
    transactions: TransactionsService;
    kwentaToken: KwentaTokenService;
    prices: PricesService;
    system: SystemService;
    constructor(context: IContext);
    setProvider(provider: ethers.providers.Provider): Promise<import("./types/common").NetworkId>;
    setSigner(signer: ethers.Signer): Promise<void>;
}
