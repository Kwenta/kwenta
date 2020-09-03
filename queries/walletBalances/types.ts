import { BigNumberish } from 'ethers';
import { CurrencyKey } from 'constants/currency';

export type SynthBalance = {
	currencyKey: CurrencyKey;
	balance: number;
	balanceBN: BigNumberish;
	usdBalance: number;
};

export type SynthBalances = SynthBalance[];

export type SynthBalancesMap = Record<CurrencyKey, SynthBalance>;
