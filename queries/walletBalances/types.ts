import { BigNumberish } from 'ethers';
import { CurrencyKey } from 'constants/currency';

export type WalletBalance = {
	balance: number;
	balanceBN: BigNumberish;
	usdBalance: number;
};

export type WalletBalances = WalletBalance[];

export type WalletBalancesMap = Record<CurrencyKey, WalletBalance>;
