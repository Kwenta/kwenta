import Wei from '@synthetixio/wei';
import { BigNumber } from 'ethers';

import { FuturesMarketAsset, FuturesPotentialTradeDetails } from 'sdk/types/futures';
import { Balances } from 'sdk/types/synths';

export type FuturesOpenInterest = {
	asset: string;
	ratio: {
		short: number;
		long: number;
	};
};

export type Participant = {
	username: string;
	address: string;
};

export type FuturesOneMinuteStat = {
	trades: Wei;
	volume: Wei;
};

export type FuturesDailyTradeStats = {
	totalVolume: Wei;
	totalTrades: number;
};

export type FuturesTotalTrades = {
	totalTrades: string;
};

export type FuturesLiquidations = {
	liquidations: string;
};

export type FuturesTradeWithPrice = {
	size: string;
	price: string;
};

export type FuturesStat = {
	account: string;
	pnlWithFeesPaid: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
	pnl?: Wei;
};

export type AccountStat = {
	rank: number;
	account: string;
	trader: string;
	traderShort: string;
	traderEns?: string | null;
	totalTrades: number;
	totalVolume: Wei;
	liquidations: number;
	pnl: Wei;
};

export type FuturesCumulativeStats = {
	totalTrades: string;
	totalTraders: string;
	totalVolume: string;
	totalLiquidations: string;
	averageTradeSize: string;
};

export type FundingRateUpdate = {
	funding: Wei;
	timestamp: number;
};

export type FundingRates = {
	[key in FuturesMarketAsset]: Wei;
};

export type FuturesPotentialTradeDetailsQuery = {
	data: FuturesPotentialTradeDetails | null;
	error: string | null;
	status: 'fetching' | 'complete' | 'idle' | 'error';
};

export enum FuturesAccountTypes {
	ISOLATED_MARGIN = 'isolated_margin',
	CROSS_MARGIN = 'cross_margin',
}

type Wallet = string;
type CrossMarginAccount = string;
type FactoryAddress = string;
export type CrossMarginAccounts = Record<FactoryAddress, Record<Wallet, CrossMarginAccount>>;

export type Portfolio = {
	total: Wei;
	crossMarginFutures: Wei;
	isolatedMarginFutures: Wei;
};

export type SynthBalances = Balances & {
	susdWalletBalance: Wei;
};

export type TradeFees = {
	staticFee: Wei;
	crossMarginFee: Wei;
	keeperEthDeposit: Wei;
	limitStopOrderFee: Wei;
	total: Wei;
};

export type FuturesTradeInputs = {
	nativeSize: string;
	susdSize: string;
	leverage: string;
	nativeSizeDelta: Wei;
	susdSizeDelta: Wei;
	orderPrice?: Wei | undefined;
};

export type SpotsFee = {
	timestamp: string;
	toAddress: string;
	feesInUSD: string;
};

export type FuturesFee = {
	timestamp: string;
	account: string;
	feesPaid: string;
};

export type TradingRewardScore = {
	address: string;
	totalFeesPaid: BigNumber;
	stakedBalance: BigNumber;
	tradingRewardsScore: number;
};
