import Wei from '@synthetixio/wei';
import { BigNumberish } from 'ethers';

import { FuturesMarketAsset } from './futures';

export type CurrencyRate = BigNumberish;
export type SynthRatesTuple = [string[], CurrencyRate[]];
export type Price<T = Wei> = {
	offChain?: T | undefined;
	onChain?: T | undefined;
};
export type Prices<T = Wei> = Record<string, Price<T>>;

export type PricesMap<T = Wei> = Partial<Record<FuturesMarketAsset, T>>;

export type PriceType = 'on_chain' | 'off_chain';

export type PricesListener = (updatedPrices: { type: PriceType; prices: PricesMap }) => void;
