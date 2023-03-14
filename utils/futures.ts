import Wei, { wei } from '@synthetixio/wei';
import { TFunction } from 'i18next';

import {
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrder,
	FuturesOrderType,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesTrade,
	FuturesVolumes,
	PositionSide,
} from 'sdk/types/futures';
import { PricesMap } from 'sdk/types/prices';
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
	MarkPrices,
} from 'state/futures/types';
import { deserializeWeiObject } from 'state/helpers';

import { formatNumber, zeroBN } from './formatters/number';

export const getMarketName = (asset: FuturesMarketAsset) => {
	return `${getDisplayAsset(asset)}-PERP`;
};

export const getDisplayAsset = (asset: string | null) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};

export const getSynthDescription = (synth: FuturesMarketAsset, t: TFunction) => {
	const assetDisplayName = AssetDisplayByAsset[synth];
	return t('common.currency.futures-market-short-name', {
		currencyName: assetDisplayName,
	});
};

export const isDecimalFour = (marketKeyOrAsset: string | undefined): boolean =>
	marketKeyOrAsset === 'sEUR' ||
	marketKeyOrAsset === 'EUR' ||
	marketKeyOrAsset === 'sDOGE' ||
	marketKeyOrAsset === 'DOGE';

export const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset> = {
	[FuturesMarketKey.sBTCPERP]: FuturesMarketAsset.sBTC,
	[FuturesMarketKey.sETHPERP]: FuturesMarketAsset.sETH,
	[FuturesMarketKey.sLINKPERP]: FuturesMarketAsset.LINK,
	[FuturesMarketKey.sSOLPERP]: FuturesMarketAsset.SOL,
	[FuturesMarketKey.sAVAXPERP]: FuturesMarketAsset.AVAX,
	[FuturesMarketKey.sAAVEPERP]: FuturesMarketAsset.AAVE,
	[FuturesMarketKey.sUNIPERP]: FuturesMarketAsset.UNI,
	[FuturesMarketKey.sMATICPERP]: FuturesMarketAsset.MATIC,
	[FuturesMarketKey.sXAUPERP]: FuturesMarketAsset.XAU,
	[FuturesMarketKey.sXAGPERP]: FuturesMarketAsset.XAG,
	[FuturesMarketKey.sEURPERP]: FuturesMarketAsset.EUR,
	[FuturesMarketKey.sAPEPERP]: FuturesMarketAsset.APE,
	[FuturesMarketKey.sDYDXPERP]: FuturesMarketAsset.DYDX,
	[FuturesMarketKey.sBNBPERP]: FuturesMarketAsset.BNB,
	[FuturesMarketKey.sDOGEPERP]: FuturesMarketAsset.DOGE,
	[FuturesMarketKey.sOPPERP]: FuturesMarketAsset.OP,
	[FuturesMarketKey.sATOMPERP]: FuturesMarketAsset.ATOM,
	[FuturesMarketKey.sFTMPERP]: FuturesMarketAsset.FTM,
	[FuturesMarketKey.sNEARPERP]: FuturesMarketAsset.NEAR,
	[FuturesMarketKey.sFLOWPERP]: FuturesMarketAsset.FLOW,
	[FuturesMarketKey.sAXSPERP]: FuturesMarketAsset.AXS,
	[FuturesMarketKey.sAUDPERP]: FuturesMarketAsset.AUD,
	[FuturesMarketKey.sGBPPERP]: FuturesMarketAsset.GBP,
} as const;

export const MarketKeyByAsset: Record<FuturesMarketAsset, FuturesMarketKey> = {
	[FuturesMarketAsset.sBTC]: FuturesMarketKey.sBTCPERP,
	[FuturesMarketAsset.sETH]: FuturesMarketKey.sETHPERP,
	[FuturesMarketAsset.LINK]: FuturesMarketKey.sLINKPERP,
	[FuturesMarketAsset.SOL]: FuturesMarketKey.sSOLPERP,
	[FuturesMarketAsset.AVAX]: FuturesMarketKey.sAVAXPERP,
	[FuturesMarketAsset.AAVE]: FuturesMarketKey.sAAVEPERP,
	[FuturesMarketAsset.UNI]: FuturesMarketKey.sUNIPERP,
	[FuturesMarketAsset.MATIC]: FuturesMarketKey.sMATICPERP,
	[FuturesMarketAsset.XAU]: FuturesMarketKey.sXAUPERP,
	[FuturesMarketAsset.XAG]: FuturesMarketKey.sXAGPERP,
	[FuturesMarketAsset.EUR]: FuturesMarketKey.sEURPERP,
	[FuturesMarketAsset.APE]: FuturesMarketKey.sAPEPERP,
	[FuturesMarketAsset.DYDX]: FuturesMarketKey.sDYDXPERP,
	[FuturesMarketAsset.BNB]: FuturesMarketKey.sBNBPERP,
	[FuturesMarketAsset.DOGE]: FuturesMarketKey.sDOGEPERP,
	[FuturesMarketAsset.OP]: FuturesMarketKey.sOPPERP,
	[FuturesMarketAsset.ATOM]: FuturesMarketKey.sATOMPERP,
	[FuturesMarketAsset.FTM]: FuturesMarketKey.sFTMPERP,
	[FuturesMarketAsset.NEAR]: FuturesMarketKey.sNEARPERP,
	[FuturesMarketAsset.FLOW]: FuturesMarketKey.sFLOWPERP,
	[FuturesMarketAsset.AXS]: FuturesMarketKey.sAXSPERP,
	[FuturesMarketAsset.AUD]: FuturesMarketKey.sAUDPERP,
	[FuturesMarketAsset.GBP]: FuturesMarketKey.sGBPPERP,
} as const;

export const AssetDisplayByAsset: Record<FuturesMarketAsset, string> = {
	[FuturesMarketAsset.sBTC]: 'Bitcoin',
	[FuturesMarketAsset.sETH]: 'Ether',
	[FuturesMarketAsset.LINK]: 'Chainlink',
	[FuturesMarketAsset.SOL]: 'Solana',
	[FuturesMarketAsset.AVAX]: 'Avalanche',
	[FuturesMarketAsset.AAVE]: 'Aave',
	[FuturesMarketAsset.UNI]: 'Uniswap',
	[FuturesMarketAsset.MATIC]: 'Polygon',
	[FuturesMarketAsset.XAU]: 'Gold',
	[FuturesMarketAsset.XAG]: 'Silver',
	[FuturesMarketAsset.EUR]: 'Euro',
	[FuturesMarketAsset.APE]: 'ApeCoin',
	[FuturesMarketAsset.DYDX]: 'DYDX',
	[FuturesMarketAsset.BNB]: 'Binance Coin',
	[FuturesMarketAsset.DOGE]: 'Dogecoin',
	[FuturesMarketAsset.OP]: 'Optimism',
	[FuturesMarketAsset.ATOM]: 'Cosmos',
	[FuturesMarketAsset.FTM]: 'Fantom',
	[FuturesMarketAsset.NEAR]: 'Near',
	[FuturesMarketAsset.FLOW]: 'Flow',
	[FuturesMarketAsset.AXS]: 'Axie Infinity',
	[FuturesMarketAsset.AUD]: 'Australian Dollar',
	[FuturesMarketAsset.GBP]: 'Pound Sterling',
} as const;

export const marketOverrides: Partial<Record<FuturesMarketKey, Record<string, any>>> = {
	[FuturesMarketKey.sETHPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sBTCPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sLINKPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sSOLPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sAVAXPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sAAVEPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sUNIPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sMATICPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sXAUPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sXAGPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sEURPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sAPEPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sDYDXPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sBNBPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sDOGEPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sOPPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sATOMPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sFTMPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sNEARPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sFLOWPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sAXSPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sAUDPERP]: {
		maxLeverage: wei(25),
	},
	[FuturesMarketKey.sGBPPERP]: {
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
	prices: MarkPrices,
	positionHistory: FuturesPositionHistory[]
): FuturesPosition => {
	const deserializedPositionDetails = deserializeWeiObject(
		positionDetails,
		futuresPositionKeys
	) as FuturesPosition;
	const offChainPrice = prices[MarketKeyByAsset[deserializedPositionDetails.asset]];
	const position = deserializedPositionDetails.position;
	const thisPositionHistory = positionHistory.find(
		({ isOpen, asset }) => isOpen && asset === positionDetails.asset
	);

	const pnl =
		!!thisPositionHistory && !!position && !!offChainPrice
			? position.size.mul(
					thisPositionHistory.avgEntryPrice
						.sub(offChainPrice)
						.mul(position.side === PositionSide.LONG ? -1 : 1)
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
		currentFundingVelocity: market.currentFundingVelocity.toString(),
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
		currentFundingVelocity: wei(m.currentFundingVelocity),
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
		margin: t.margin.toString(),
		size: t.size.toString(),
		price: t.price.toString(),
		positionSize: t.positionSize.toString(),
		pnl: t.pnl.toString(),
		feesPaid: t.feesPaid.toString(),
	}));
};

export const unserializeTrades = (trades: FuturesTrade<string>[]): FuturesTrade<Wei>[] => {
	return trades.map((t) => ({
		...t,
		margin: wei(t.margin),
		size: wei(t.size),
		price: wei(t.price),
		positionSize: wei(t.positionSize),
		pnl: wei(t.pnl),
		feesPaid: wei(t.feesPaid),
	}));
};

export const unserializeFundingRates = (rates: FundingRate<string>[]): FundingRate[] => {
	return rates.map((r) => ({ ...r, fundingRate: r.fundingRate ? wei(r.fundingRate) : null }));
};
