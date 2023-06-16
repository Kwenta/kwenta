import { CurrencyKey } from '../types/common';
import { FuturesMarketKey } from '../types/futures';
export declare const synthToAsset: (currencyKey: CurrencyKey | FuturesMarketKey) => string;
export declare const isFiatCurrency: (currencyKey: CurrencyKey) => boolean;
