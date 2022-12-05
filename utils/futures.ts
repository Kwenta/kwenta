import { NetworkId, NetworkNameById, Synth } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { TFunction } from 'i18next';
import { Dictionary } from 'lodash';

import { FuturesOrderType, FuturesTradeInputs, TradeFees } from 'queries/futures/types';
import { FuturesMarket, FuturesOrder, FuturesPosition, FuturesVolumes } from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import {
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	CrossMarginTradeInputs,
	FundingRate,
	FundingRateSerialized,
	TransactionEstimation,
} from 'state/futures/types';
import logError from 'utils/logError';

import { formatNumber, zeroBN } from './formatters/number';

export const getMarketAsset = (marketKey: FuturesMarketKey) => {
	return markets[marketKey].asset;
};

export const getMarketName = (asset: FuturesMarketAsset | null) => {
	switch (asset) {
		case 'DebtRatio':
			return `DEBT-PERP`;
		default:
			return `${getDisplayAsset(asset)}-PERP`;
	}
};

export const getDisplayAsset = (asset: string | null) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};

export const getSynthDescription = (synth: string, synthsMap: Dictionary<Synth>, t: TFunction) => {
	const parsedSynthKey = synth ? (synth[0] !== 's' ? `s${synth}` : synth) : '';
	switch (parsedSynthKey) {
		case 'sXAU':
			return t('common.currency.futures-market-gold-short-name');
		case 'sXAG':
			return t('common.currency.futures-market-silver-short-name');
		case 'sAPE':
			return t('common.currency.futures-market-ape-short-name');
		case 'sBNB':
			return t('common.currency.futures-market-bnb-short-name');
		case 'sDOGE':
			return t('common.currency.futures-market-doge-short-name');
		case 'sXMR':
			return t('common.currency.futures-market-xmr-short-name');
		case 'sDebtRatio':
			return t('common.currency.futures-market-debtratio-short-name');
		case 'sOP':
			return t('common.currency.futures-market-op-short-name');
		case 'sDYDX':
			return t('common.currency.futures-market-short-name', {
				currencyName: getDisplayAsset(synth),
			});
		default:
			return t('common.currency.futures-market-short-name', {
				currencyName:
					parsedSynthKey && synthsMap[parsedSynthKey] ? synthsMap[parsedSynthKey].description : '',
			});
	}
};

export const isDecimalFour = (marketKeyOrAsset: string | undefined): boolean =>
	marketKeyOrAsset === 'sEUR' ||
	marketKeyOrAsset === 'EUR' ||
	marketKeyOrAsset === 'sDOGE' ||
	marketKeyOrAsset === 'DOGE' ||
	marketKeyOrAsset === 'sDebtRatio' ||
	marketKeyOrAsset === 'DebtRatio';

export enum FuturesMarketKey {
	sETHPERP = 'sETHPERP',
	sBTCPERP = 'sBTCPERP',
	sETH = 'sETH',
	sBTC = 'sBTC',
	sLINK = 'sLINK',
	sSOL = 'sSOL',
	sAVAX = 'sAVAX',
	sAAVE = 'sAAVE',
	sUNI = 'sUNI',
	sMATIC = 'sMATIC',
	sXAU = 'sXAU',
	sXAG = 'sXAG',
	sEUR = 'sEUR',
	sAPE = 'sAPE',
	sDYDX = 'sDYDX',
	sBNB = 'sBNB',
	sDOGE = 'sDOGE',
	sDebtRatio = 'sDebtRatio',
	sXMR = 'sXMR',
	sOP = 'sOP',
}

export enum FuturesMarketAsset {
	sBTC = 'sBTC',
	sETH = 'sETH',
	sLINK = 'sLINK',
	SOL = 'SOL',
	AVAX = 'AVAX',
	AAVE = 'AAVE',
	UNI = 'UNI',
	MATIC = 'MATIC',
	XAU = 'XAU',
	XAG = 'XAG',
	EUR = 'EUR',
	APE = 'APE',
	DYDX = 'DYDX',
	BNB = 'BNB',
	DOGE = 'DOGE',
	DebtRatio = 'DebtRatio',
	XMR = 'XMR',
	OP = 'OP',
}

export const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset> = {
	[FuturesMarketKey.sBTCPERP]: FuturesMarketAsset.sBTC,
	[FuturesMarketKey.sETHPERP]: FuturesMarketAsset.sETH,
	[FuturesMarketKey.sBTC]: FuturesMarketAsset.sBTC,
	[FuturesMarketKey.sETH]: FuturesMarketAsset.sETH,
	[FuturesMarketKey.sLINK]: FuturesMarketAsset.sLINK,
	[FuturesMarketKey.sSOL]: FuturesMarketAsset.SOL,
	[FuturesMarketKey.sAVAX]: FuturesMarketAsset.AVAX,
	[FuturesMarketKey.sAAVE]: FuturesMarketAsset.AAVE,
	[FuturesMarketKey.sUNI]: FuturesMarketAsset.UNI,
	[FuturesMarketKey.sMATIC]: FuturesMarketAsset.MATIC,
	[FuturesMarketKey.sXAU]: FuturesMarketAsset.XAU,
	[FuturesMarketKey.sXAG]: FuturesMarketAsset.XAG,
	[FuturesMarketKey.sEUR]: FuturesMarketAsset.EUR,
	[FuturesMarketKey.sAPE]: FuturesMarketAsset.APE,
	[FuturesMarketKey.sDYDX]: FuturesMarketAsset.DYDX,
	[FuturesMarketKey.sBNB]: FuturesMarketAsset.BNB,
	[FuturesMarketKey.sDOGE]: FuturesMarketAsset.DOGE,
	[FuturesMarketKey.sDebtRatio]: FuturesMarketAsset.DebtRatio,
	[FuturesMarketKey.sXMR]: FuturesMarketAsset.XMR,
	[FuturesMarketKey.sOP]: FuturesMarketAsset.OP,
} as const;

export const MarketKeyByAsset: Record<FuturesMarketAsset, FuturesMarketKey> = {
	// perps v2
	[FuturesMarketAsset.sBTC]: FuturesMarketKey.sBTCPERP,
	[FuturesMarketAsset.sETH]: FuturesMarketKey.sETHPERP,

	// perps v1
	[FuturesMarketAsset.sLINK]: FuturesMarketKey.sLINK,
	[FuturesMarketAsset.SOL]: FuturesMarketKey.sSOL,
	[FuturesMarketAsset.AVAX]: FuturesMarketKey.sAVAX,
	[FuturesMarketAsset.AAVE]: FuturesMarketKey.sAAVE,
	[FuturesMarketAsset.UNI]: FuturesMarketKey.sUNI,
	[FuturesMarketAsset.MATIC]: FuturesMarketKey.sMATIC,
	[FuturesMarketAsset.XAU]: FuturesMarketKey.sXAU,
	[FuturesMarketAsset.XAG]: FuturesMarketKey.sXAG,
	[FuturesMarketAsset.EUR]: FuturesMarketKey.sEUR,
	[FuturesMarketAsset.APE]: FuturesMarketKey.sAPE,
	[FuturesMarketAsset.DYDX]: FuturesMarketKey.sDYDX,
	[FuturesMarketAsset.BNB]: FuturesMarketKey.sBNB,
	[FuturesMarketAsset.DOGE]: FuturesMarketKey.sDOGE,
	[FuturesMarketAsset.DebtRatio]: FuturesMarketKey.sDebtRatio,
	[FuturesMarketAsset.XMR]: FuturesMarketKey.sXMR,
	[FuturesMarketAsset.OP]: FuturesMarketKey.sOP,
} as const;

export interface FuturesMarketConfig {
	key: FuturesMarketKey;
	asset: FuturesMarketAsset;
	supports: 'mainnet' | 'testnet' | 'both';
	disabled?: boolean;
}

export const markets: Record<FuturesMarketKey, FuturesMarketConfig> = {
	// perps v2
	[FuturesMarketKey.sBTCPERP]: {
		key: FuturesMarketKey.sBTCPERP,
		asset: FuturesMarketAsset.sBTC,
		supports: 'testnet',
	},
	[FuturesMarketKey.sETHPERP]: {
		key: FuturesMarketKey.sETHPERP,
		asset: FuturesMarketAsset.sETH,
		supports: 'testnet',
	},

	// perps v1
	[FuturesMarketKey.sBTC]: {
		key: FuturesMarketKey.sBTC,
		asset: FuturesMarketAsset.sBTC,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sETH]: {
		key: FuturesMarketKey.sETH,
		asset: FuturesMarketAsset.sETH,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sLINK]: {
		key: FuturesMarketKey.sLINK,
		asset: FuturesMarketAsset.sLINK,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sSOL]: {
		key: FuturesMarketKey.sSOL,
		asset: FuturesMarketAsset.SOL,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sAVAX]: {
		key: FuturesMarketKey.sAVAX,
		asset: FuturesMarketAsset.AVAX,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sAAVE]: {
		key: FuturesMarketKey.sAAVE,
		asset: FuturesMarketAsset.AAVE,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sUNI]: {
		key: FuturesMarketKey.sUNI,
		asset: FuturesMarketAsset.UNI,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sMATIC]: {
		key: FuturesMarketKey.sMATIC,
		asset: FuturesMarketAsset.MATIC,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sXAU]: {
		key: FuturesMarketKey.sXAU,
		asset: FuturesMarketAsset.XAU,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sXAG]: {
		key: FuturesMarketKey.sXAG,
		asset: FuturesMarketAsset.XAG,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sEUR]: {
		key: FuturesMarketKey.sEUR,
		asset: FuturesMarketAsset.EUR,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sAPE]: {
		key: FuturesMarketKey.sAPE,
		asset: FuturesMarketAsset.APE,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sDYDX]: {
		key: FuturesMarketKey.sDYDX,
		asset: FuturesMarketAsset.DYDX,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sBNB]: {
		key: FuturesMarketKey.sBNB,
		asset: FuturesMarketAsset.BNB,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sDOGE]: {
		key: FuturesMarketKey.sDOGE,
		asset: FuturesMarketAsset.DOGE,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sDebtRatio]: {
		key: FuturesMarketKey.sDebtRatio,
		asset: FuturesMarketAsset.DebtRatio,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sXMR]: {
		key: FuturesMarketKey.sXMR,
		asset: FuturesMarketAsset.XMR,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sOP]: {
		key: FuturesMarketKey.sOP,
		asset: FuturesMarketAsset.OP,
		supports: 'mainnet',
	},
};

export const marketsList = Object.values(markets).filter((m) => !m.disabled);

export const mainnetMarkets = marketsList.filter(
	(m) => m.supports === 'mainnet' || m.supports === 'both'
);

export const testnetMarkets = marketsList.filter(
	(m) => m.supports === 'testnet' || m.supports === 'both'
);

export const marketsForNetwork = (networkId: NetworkId) => {
	const network = NetworkNameById[networkId];

	switch (network) {
		case 'mainnet-ovm':
			return mainnetMarkets;
		case 'goerli-ovm':
			return testnetMarkets;
		default:
			logError('You cannot use futures on this network.');
			return [];
	}
};

export const orderPriceInvalidLabel = (
	orderPrice: string,
	leverageSide: PositionSide,
	currentPrice: Wei,
	orderType: FuturesOrderType
): string | null => {
	if (!orderPrice || Number(orderPrice) <= 0) return null;
	const isLong = leverageSide === 'long';
	if (
		((isLong && orderType === 'limit') || (!isLong && orderType === 'stop market')) &&
		wei(orderPrice).gt(currentPrice)
	)
		return 'max ' + formatNumber(currentPrice);
	if (
		((!isLong && orderType === 'limit') || (isLong && orderType === 'stop market')) &&
		wei(orderPrice).lt(currentPrice)
	)
		return 'min ' + formatNumber(currentPrice);
	return null;
};

const getPositionChangeState = (existingSize: Wei, newSize: Wei) => {
	if (newSize.eq(0)) return 'closing';
	if (existingSize.eq(newSize)) return 'edit_leverage';
	if (existingSize.eq(0)) return 'increase_size';
	if ((existingSize.gt(0) && newSize.lt(0)) || (existingSize.lt(0) && newSize.gt(0)))
		return 'flip_side';
	if (
		(existingSize.gt(0) && newSize.gt(existingSize)) ||
		(existingSize.lt(0) && newSize.lt(existingSize))
	)
		return 'increase_size';
	return 'reduce_size';
};

export const calculateMarginDelta = (
	nextTrade: FuturesTradeInputs,
	fees: TradeFees,
	position: FuturesPosition | null | undefined
) => {
	const existingSize = position?.position
		? position?.position?.side === 'long'
			? position?.position?.size
			: position?.position?.size.neg()
		: zeroBN;

	const newSize = existingSize.add(nextTrade.nativeSizeDelta);
	const newSizeAbs = newSize.abs();
	const posChangeState = getPositionChangeState(existingSize, newSize);

	switch (posChangeState) {
		case 'closing':
			return zeroBN;
		case 'edit_leverage':
			const nextMargin = position?.position?.notionalValue.div(nextTrade.leverage) ?? zeroBN;
			const delta = nextMargin.sub(position?.remainingMargin);
			return delta.add(fees.total);
		case 'reduce_size':
			// When a position is reducing we keep the leverage the same as the existing position
			let marginDiff = nextTrade.susdSizeDelta.div(position?.position?.leverage ?? zeroBN);
			return nextTrade.susdSizeDelta.gt(0)
				? marginDiff.neg().add(fees.total)
				: marginDiff.add(fees.total);
		case 'increase_size':
			// When a position is increasing we calculate margin for selected leverage
			return nextTrade.susdSizeDelta.abs().div(nextTrade.leverage).add(fees.total);
		case 'flip_side':
			// When flipping sides we calculate the margin required for selected leverage
			const newNotionalSize = newSizeAbs.mul(nextTrade.orderPrice);
			const newMargin = newNotionalSize.div(nextTrade.leverage);
			const remainingMargin =
				position?.position?.size.mul(nextTrade.orderPrice).div(position?.position?.leverage) ??
				zeroBN;
			const marginDelta = newMargin.sub(remainingMargin ?? zeroBN);
			return marginDelta.add(fees.total);
	}
};

export const serializeMarkets = (markets: FuturesMarket[]): FuturesMarket<string>[] => {
	return markets.map((m) => {
		return {
			...m,
			currentFundingRate: m.currentFundingRate.toString(),
			currentRoundId: m.currentRoundId.toString(),
			feeRates: {
				makerFee: m.feeRates.makerFee.toString(),
				takerFee: m.feeRates.takerFee.toString(),
				makerFeeDelayedOrder: m.feeRates.makerFeeDelayedOrder.toString(),
				takerFeeDelayedOrder: m.feeRates.takerFeeDelayedOrder.toString(),
				makerFeeOffchainDelayedOrder: m.feeRates.makerFeeOffchainDelayedOrder.toString(),
				takerFeeOffchainDelayedOrder: m.feeRates.takerFeeOffchainDelayedOrder.toString(),
			},
			openInterest: m.openInterest
				? {
						...m.openInterest,
						shortUSD: m.openInterest.shortUSD.toString(),
						longUSD: m.openInterest.longUSD.toString(),
				  }
				: undefined,
			marketDebt: m.marketDebt.toString(),
			marketSkew: m.marketSkew.toString(),
			marketSize: m.marketSize.toString(),
			maxLeverage: m.maxLeverage.toString(),
			price: m.price.toString(),
			minInitialMargin: m.minInitialMargin.toString(),
			keeperDeposit: m.keeperDeposit.toString(),
			marketLimit: m.marketLimit.toString(),
		};
	});
};

export const unserializeMarkets = (markets: FuturesMarket<string>[]): FuturesMarket[] => {
	return markets.map((m) => ({
		...m,
		currentFundingRate: wei(m.currentFundingRate),
		currentRoundId: wei(m.currentRoundId),
		feeRates: {
			makerFee: wei(m.feeRates.makerFee),
			takerFee: wei(m.feeRates.takerFee),
			makerFeeDelayedOrder: wei(m.feeRates.makerFeeDelayedOrder),
			takerFeeDelayedOrder: wei(m.feeRates.takerFeeDelayedOrder),
			makerFeeOffchainDelayedOrder: wei(m.feeRates.makerFeeOffchainDelayedOrder),
			takerFeeOffchainDelayedOrder: wei(m.feeRates.takerFeeOffchainDelayedOrder),
		},
		openInterest: m.openInterest
			? {
					...m.openInterest,
					shortUSD: wei(m.openInterest.shortUSD),
					longUSD: wei(m.openInterest.longUSD),
			  }
			: undefined,
		marketDebt: wei(m.marketDebt),
		marketSkew: wei(m.marketSkew),
		marketSize: wei(m.marketSize),
		maxLeverage: wei(m.maxLeverage),
		price: wei(m.price),
		minInitialMargin: wei(m.minInitialMargin),
		keeperDeposit: wei(m.keeperDeposit),
		marketLimit: wei(m.marketLimit),
	}));
};

export const unserializeFundingRates = (rates: FundingRateSerialized[]): FundingRate[] => {
	return rates.map((r) => ({ ...r, fundingRate: r.fundingRate ? wei(r.fundingRate) : null }));
};

export const serializeCmBalanceInfo = (
	overview: CrossMarginBalanceInfo
): CrossMarginBalanceInfo<string> => {
	return {
		freeMargin: overview.freeMargin.toString(),
		keeperEthBal: overview.keeperEthBal.toString(),
		allowance: overview.allowance.toString(),
	};
};

export const unserializeCmBalanceInfo = (
	overview: CrossMarginBalanceInfo<string>
): CrossMarginBalanceInfo<Wei> => {
	return {
		freeMargin: wei(overview.freeMargin),
		keeperEthBal: wei(overview.keeperEthBal),
		allowance: wei(overview.allowance),
	};
};

export const serializeFuturesVolumes = (volumes: FuturesVolumes) => {
	return Object.keys(volumes).reduce<FuturesVolumes<string>>((acc, k) => {
		acc[k] = {
			trades: volumes[k].trades.toString(),
			volume: volumes[k].volume.toString(),
		};
		return acc;
	}, {});
};

export const unserializeFuturesVolumes = (volumes: FuturesVolumes<string>) => {
	return Object.keys(volumes).reduce<FuturesVolumes>((acc, k) => {
		acc[k] = {
			trades: wei(volumes[k].trades),
			volume: wei(volumes[k].volume),
		};
		return acc;
	}, {});
};

export const serializeCrossMarginTradeInputs = (
	tradeInputs: CrossMarginTradeInputs
): CrossMarginTradeInputs<string> => {
	return {
		...tradeInputs,
		nativeSizeDelta: tradeInputs.nativeSizeDelta.toString(),
		susdSizeDelta: tradeInputs.susdSizeDelta.toString(),
	};
};

export const unserializeCrossMarginTradeInputs = (
	tradeInputs: CrossMarginTradeInputs<string>
): CrossMarginTradeInputs => {
	return {
		...tradeInputs,
		nativeSizeDelta: wei(tradeInputs.nativeSizeDelta || 0),
		susdSizeDelta: wei(tradeInputs.susdSizeDelta || 0),
	};
};

export const serializeFuturesOrders = (orders: FuturesOrder[]): FuturesOrder<string>[] => {
	return orders.map((o) => ({
		...o,
		size: o.size.toString(),
		targetPrice: o.targetPrice?.toString() ?? null,
		marginDelta: o.marginDelta.toString(),
		targetRoundId: o.targetRoundId?.toString() ?? null,
		timestamp: o.timestamp.toString(),
	}));
};

export const unserializeFuturesOrders = (orders: FuturesOrder<string>[]): FuturesOrder[] => {
	return orders.map((o) => ({
		...o,
		size: wei(o.size),
		targetPrice: o.targetPrice ? wei(o.targetPrice) : null,
		marginDelta: wei(o.marginDelta),
		targetRoundId: o.targetRoundId ? wei(o.targetRoundId) : null,
		timestamp: wei(o.timestamp),
	}));
};

export const serializeCrossMarginSettings = (
	settings: CrossMarginSettings
): CrossMarginSettings<string> => ({
	tradeFee: settings.tradeFee.toString(),
	limitOrderFee: settings.limitOrderFee.toString(),
	stopOrderFee: settings.stopOrderFee.toString(),
});

export const unserializeCrossMarginSettings = (
	settings: CrossMarginSettings<string>
): CrossMarginSettings => ({
	tradeFee: wei(settings.tradeFee),
	limitOrderFee: wei(settings.limitOrderFee),
	stopOrderFee: wei(settings.stopOrderFee),
});

export const unserializeGasEstimate = (
	estimate: TransactionEstimation<string>
): TransactionEstimation => ({
	...estimate,
	limit: wei(estimate.limit),
	cost: wei(estimate.cost),
});
