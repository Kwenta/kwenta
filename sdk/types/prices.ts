import Wei from '@synthetixio/wei';
import { BigNumberish } from 'ethers';

import { FuturesMarketAsset } from './futures';

export type CurrencyPrice = BigNumberish;
export type SynthPricesTuple = [string[], CurrencyPrice[]];
export type Price<T = Wei> = {
	offChain?: T | undefined;
	onChain?: T | undefined;
};

export type AssetKey = FuturesMarketAsset | 'sUSD';

export type Prices<T = Wei> = Record<string, Price<T>>;

export type PricesMap<T = Wei> = Partial<Record<AssetKey, T>>;

export type SynthPrice = {
	synth: string;
	rate: Wei;
};

export type PriceType = 'on_chain' | 'off_chain';

export type PricesListener = (updatedPrices: { type: PriceType; prices: PricesMap }) => void;
