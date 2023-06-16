import Wei from '@synthetixio/wei';

import { CurrencyKey } from '../types/common';

export type SynthBalance = {
	currencyKey: CurrencyKey;
	balance: Wei;
	usdBalance: Wei;
};

export type SynthBalancesMap = Partial<{ [key: string]: SynthBalance }>;

export type Balances = {
	balancesMap: SynthBalancesMap;
	balances: SynthBalance[];
	totalUSDBalance: Wei;
};

export type SynthResult = {
	id: string;
	name: string;
	symbol: string;
	totalSupply: Wei;
};

export type WalletTradesExchangeResult = {
	id: string;
	fromSynth: Partial<SynthResult> | null;
	toSynth: Partial<SynthResult> | null;
	fromAmount: Wei;
	fromAmountInUSD: Wei;
	toAmount: Wei;
	toAmountInUSD: Wei;
	feesInUSD: Wei;
	toAddress: string;
	timestamp: number;
	gasPrice: Wei;
	hash: string;
};

export type DeprecatedSynthBalance = {
	currencyKey: CurrencyKey;
	proxyAddress: string;
	balance: Wei;
	usdBalance: Wei;
};
