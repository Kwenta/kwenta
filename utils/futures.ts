import { Synth } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { TFunction } from 'i18next';
import { Dictionary } from 'lodash';

import {
	FuturesMarket,
	FuturesOrder,
	FuturesOrderType,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesTrade,
	FuturesVolumes,
	PositionSide,
} from 'sdk/types/futures';
import { Prices, PricesMap } from 'sdk/types/prices';
import {
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	CrossMarginTradeFees,
	CrossMarginTradeInputs,
	DelayedOrderWithDetails,
	IsolatedMarginTradeInputs,
	TransactionEstimation,
	futuresPositionKeys,
	FundingRate,
} from 'state/futures/types';
import { deserializeWeiObject } from 'state/helpers';

import { formatNumber, zeroBN } from './formatters/number';

export const getMarketName = (asset: FuturesMarketAsset) => {
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

export const marketOverrides: Partial<Record<FuturesMarketKey, Record<string, any>>> = {
	[FuturesMarketKey.sETHPERP]: {
		maxLeverage: wei(25),
	},
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
		((isLong && orderType === 'limit') || (!isLong && orderType === 'stop_market')) &&
		wei(orderPrice).gt(currentPrice)
	)
		return 'max ' + formatNumber(currentPrice);
	if (
		((!isLong && orderType === 'limit') || (isLong && orderType === 'stop_market')) &&
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

export const updatePositionUpnl = (
	positionDetails: FuturesPosition<string>,
	prices: Prices
): FuturesPosition => {
	const deserializedPositionDetails = deserializeWeiObject(
		positionDetails,
		futuresPositionKeys
	) as FuturesPosition;
	const offChainPrice = prices[deserializedPositionDetails.asset]?.offChain;
	const position = deserializedPositionDetails.position;

	const pnl =
		!!position && !!offChainPrice
			? position.size.mul(
					position.lastPrice.sub(offChainPrice).mul(position.side === PositionSide.LONG ? -1 : 1)
			  )
			: undefined;
	const pnlPct = pnl?.div(position?.initialMargin);

	return {
		...deserializedPositionDetails,
		position:
			!!position && !!pnl && !!pnlPct
				? {
						...position,
						pnl,
						pnlPct,
				  }
				: position,
	};
};

export const calculateMarginDelta = (
	tradeInputs: {
		nativeSizeDelta: Wei;
		susdSizeDelta: Wei;
		leverage: Wei;
		price: Wei;
	},
	fees: CrossMarginTradeFees,
	position: FuturesPosition | null | undefined
) => {
	const existingSize = position?.position
		? position?.position?.side === 'long'
			? position?.position?.size
			: position?.position?.size.neg()
		: zeroBN;

	const newSize = existingSize.add(tradeInputs.nativeSizeDelta);
	const newSizeAbs = newSize.abs();
	const posChangeState = getPositionChangeState(existingSize, newSize);

	switch (posChangeState) {
		case 'closing':
			return zeroBN;
		case 'edit_leverage':
			const nextMargin = position?.position?.notionalValue.div(tradeInputs.leverage) ?? zeroBN;
			const delta = nextMargin.sub(position?.remainingMargin);
			return delta.add(fees.total);
		case 'reduce_size':
			// When a position is reducing we keep the leverage the same as the existing position
			let marginDiff = tradeInputs.susdSizeDelta.div(position?.position?.leverage ?? zeroBN);
			return tradeInputs.susdSizeDelta.gt(0)
				? marginDiff.neg().add(fees.total)
				: marginDiff.add(fees.total);
		case 'increase_size':
			// When a position is increasing we calculate margin for selected leverage
			return tradeInputs.susdSizeDelta.abs().div(tradeInputs.leverage).add(fees.total);
		case 'flip_side':
			// When flipping sides we calculate the margin required for selected leverage
			const newNotionalSize = newSizeAbs.mul(tradeInputs.price);
			const newMargin = newNotionalSize.div(tradeInputs.leverage);
			const remainingMargin =
				position?.position?.size.mul(tradeInputs.price).div(position?.position?.leverage) ?? zeroBN;
			const marginDelta = newMargin.sub(remainingMargin ?? zeroBN);
			return marginDelta.add(fees.total);
	}
};

export const serializeMarket = (market: FuturesMarket): FuturesMarket<string> => {
	return {
		...market,
		currentFundingRate: market.currentFundingRate.toString(),
		currentRoundId: market.currentRoundId.toString(),
		feeRates: {
			makerFee: market.feeRates.makerFee.toString(),
			takerFee: market.feeRates.takerFee.toString(),
			makerFeeDelayedOrder: market.feeRates.makerFeeDelayedOrder.toString(),
			takerFeeDelayedOrder: market.feeRates.takerFeeDelayedOrder.toString(),
			makerFeeOffchainDelayedOrder: market.feeRates.makerFeeOffchainDelayedOrder.toString(),
			takerFeeOffchainDelayedOrder: market.feeRates.takerFeeOffchainDelayedOrder.toString(),
		},
		openInterest: {
			...market.openInterest,
			shortUSD: market.openInterest.shortUSD.toString(),
			longUSD: market.openInterest.longUSD.toString(),
		},
		marketDebt: market.marketDebt.toString(),
		marketSkew: market.marketSkew.toString(),
		marketSize: market.marketSize.toString(),
		maxLeverage: market.maxLeverage.toString(),
		minInitialMargin: market.minInitialMargin.toString(),
		keeperDeposit: market.keeperDeposit.toString(),
		marketLimit: market.marketLimit.toString(),
		settings: {
			...market.settings,
			maxMarketValue: market.settings.maxMarketValue.toString(),
			skewScale: market.settings.skewScale.toString(),
		},
	};
};

export const serializeMarkets = (markets: FuturesMarket[]): FuturesMarket<string>[] => {
	return markets.map((m) => serializeMarket(m));
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
		openInterest: {
			...m.openInterest,
			shortUSD: wei(m.openInterest.shortUSD),
			longUSD: wei(m.openInterest.longUSD),
		},
		marketDebt: wei(m.marketDebt),
		marketSkew: wei(m.marketSkew),
		marketSize: wei(m.marketSize),
		maxLeverage: wei(m.maxLeverage),
		minInitialMargin: wei(m.minInitialMargin),
		keeperDeposit: wei(m.keeperDeposit),
		marketLimit: wei(m.marketLimit),
		settings: {
			...m.settings,
			maxMarketValue: wei(m.settings.maxMarketValue),
			skewScale: wei(m.settings.skewScale),
		},
	}));
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
	balanceInfo: CrossMarginBalanceInfo<string>
): CrossMarginBalanceInfo<Wei> => {
	return {
		freeMargin: wei(balanceInfo.freeMargin),
		keeperEthBal: wei(balanceInfo.keeperEthBal),
		allowance: wei(balanceInfo.allowance),
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
		nativeSize: tradeInputs.nativeSize.toString(),
		susdSize: tradeInputs.susdSize.toString(),
	};
};

export const unserializeCrossMarginTradeInputs = (
	tradeInputs: CrossMarginTradeInputs<string>
): CrossMarginTradeInputs => {
	return {
		...tradeInputs,
		nativeSize: wei(tradeInputs.nativeSize || 0),
		susdSize: wei(tradeInputs.susdSize || 0),
	};
};

export const unserializeIsolatedMarginTradeInputs = (
	tradeInputs: IsolatedMarginTradeInputs<string>
): IsolatedMarginTradeInputs => {
	return {
		nativeSize: wei(tradeInputs.nativeSize || 0),
		susdSize: wei(tradeInputs.susdSize || 0),
	};
};

export const serializeFuturesOrders = (orders: FuturesOrder[]): FuturesOrder<string>[] => {
	return orders.map((o) => ({
		...o,
		size: o.size.toString(),
		targetPrice: o.targetPrice?.toString() ?? null,
		marginDelta: o.marginDelta.toString(),
		targetRoundId: o.targetRoundId?.toString() ?? null,
	}));
};

export const serializeDelayedOrder = (
	order: DelayedOrderWithDetails
): DelayedOrderWithDetails<string> => ({
	...order,
	size: order.size.toString(),
	commitDeposit: order.commitDeposit.toString(),
	keeperDeposit: order.keeperDeposit.toString(),
	priceImpactDelta: order.priceImpactDelta.toString(),
	targetRoundId: order.targetRoundId?.toString() ?? '',
});

export const serializeDelayedOrders = (
	orders: DelayedOrderWithDetails[]
): DelayedOrderWithDetails<string>[] => orders.map((o) => serializeDelayedOrder(o));

export const unserializeDelayedOrder = (
	order: DelayedOrderWithDetails<string>
): DelayedOrderWithDetails => ({
	...order,
	size: wei(order.size),
	commitDeposit: wei(order.commitDeposit),
	keeperDeposit: wei(order.keeperDeposit),
	priceImpactDelta: wei(order.priceImpactDelta),
	targetRoundId: wei(order.targetRoundId),
});

export const unserializeDelayedOrders = (
	orders: DelayedOrderWithDetails<string>[]
): DelayedOrderWithDetails[] => orders.map((o) => unserializeDelayedOrder(o));

export const unserializeFuturesOrders = (orders: FuturesOrder<string>[]): FuturesOrder[] => {
	return orders.map((o) => ({
		...o,
		size: wei(o.size),
		targetPrice: o.targetPrice ? wei(o.targetPrice) : null,
		marginDelta: wei(o.marginDelta),
		targetRoundId: o.targetRoundId ? wei(o.targetRoundId) : null,
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

export const serializeTradeFees = (fees: CrossMarginTradeFees) => ({
	staticFee: fees.staticFee.toString(),
	crossMarginFee: fees.crossMarginFee.toString(),
	keeperEthDeposit: fees.keeperEthDeposit.toString(),
	limitStopOrderFee: fees.limitStopOrderFee.toString(),
	total: fees.total.toString(),
});

export const serializePrices = (prices: PricesMap) => {
	return Object.entries(prices).reduce<PricesMap<string>>((acc, [key, price]) => {
		acc[key as FuturesMarketAsset] = price.toString();
		return acc;
	}, {});
};

export const serializePositionHistory = (
	positions: FuturesPositionHistory[]
): FuturesPositionHistory<string>[] => {
	return positions.map((p) => ({
		...p,
		size: p.size.toString(),
		feesPaid: p.feesPaid.toString(),
		netFunding: p.netFunding.toString(),
		netTransfers: p.netTransfers.toString(),
		totalDeposits: p.totalDeposits.toString(),
		initialMargin: p.initialMargin.toString(),
		margin: p.margin.toString(),
		entryPrice: p.entryPrice.toString(),
		exitPrice: p.exitPrice.toString(),
		pnl: p.pnl.toString(),
		pnlWithFeesPaid: p.pnlWithFeesPaid.toString(),
		totalVolume: p.totalVolume.toString(),
		avgEntryPrice: p.avgEntryPrice.toString(),
		leverage: p.leverage.toString(),
	}));
};

export const unserializePositionHistory = (
	positions: FuturesPositionHistory<string>[]
): FuturesPositionHistory[] => {
	return positions.map((p) => ({
		...p,
		size: wei(p.size),
		feesPaid: wei(p.feesPaid),
		netFunding: wei(p.netFunding),
		netTransfers: wei(p.netTransfers),
		totalDeposits: wei(p.totalDeposits),
		initialMargin: wei(p.initialMargin),
		margin: wei(p.margin),
		entryPrice: wei(p.entryPrice),
		exitPrice: wei(p.exitPrice),
		pnl: wei(p.pnl),
		pnlWithFeesPaid: wei(p.pnlWithFeesPaid),
		totalVolume: wei(p.totalVolume),
		avgEntryPrice: wei(p.avgEntryPrice),
		leverage: wei(p.leverage),
	}));
};

export const serializeTrades = (trades: FuturesTrade[]): FuturesTrade<string>[] => {
	return trades.map((t) => ({
		...t,
		size: t.size.toString(),
		price: t.price.toString(),
		timestamp: t.timestamp.toString(),
		positionSize: t.positionSize.toString(),
		pnl: t.pnl.toString(),
		feesPaid: t.feesPaid.toString(),
	}));
};

export const unserializeTrades = (trades: FuturesTrade<string>[]): FuturesTrade<Wei>[] => {
	return trades.map((t) => ({
		...t,
		size: wei(t.size),
		price: wei(t.price),
		timestamp: wei(t.timestamp),
		positionSize: wei(t.positionSize),
		pnl: wei(t.pnl),
		feesPaid: wei(t.feesPaid),
	}));
};

export const unserializeFundingRates = (rates: FundingRate<string>[]): FundingRate[] => {
	return rates.map((r) => ({ ...r, fundingRate: r.fundingRate ? wei(r.fundingRate) : null }));
};
