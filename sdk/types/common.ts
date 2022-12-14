import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { BigNumberish, providers } from 'ethers';

import { FuturesMarketAsset } from './futures';

export type NetworkOverrideOptions = {
	networkId: NetworkId;
	provider: providers.Provider;
};

export enum TransactionStatus {
	AwaitingExecution = 'AwaitingExecution',
	Executed = 'Executed',
	Confirmed = 'Confirmed',
	Failed = 'Failed',
}

export type CurrencyRate = BigNumberish;
export type SynthRatesTuple = [string[], CurrencyRate[]];
export type Price<T = Wei> = {
	offChain?: T | undefined;
	onChain?: T | undefined;
};
export type Prices<T = Wei> = Record<string, Price<T>>;

export type PricesMap<T = Wei> = Partial<Record<FuturesMarketAsset, T>>;

export type PriceType = 'on_chain' | 'off_chain';
