import { createSelector } from '@reduxjs/toolkit';
import Wei, { wei } from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';

import { DEFAULT_LEVERAGE, DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { APP_MAX_LEVERAGE, DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import { SL_TP_MAX_SIZE } from 'sdk/constants/futures';
import { TransactionStatus } from 'sdk/types/common';
import { ConditionalOrderTypeEnum, FuturesPosition, PositionSide } from 'sdk/types/futures';
import { unserializePotentialTrade } from 'sdk/utils/futures';
import { selectSusdBalance } from 'state/balances/selectors';
import { accountType, deserializeWeiObject } from 'state/helpers';
import { selectOffchainPricesInfo, selectPrices } from 'state/prices/selectors';
import { RootState } from 'state/store';
import { FetchStatus } from 'state/types';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { computeOrderFee, sameSide } from 'utils/costCalculations';
import { getKnownError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import {
	MarketKeyByAsset,
	unserializeCmBalanceInfo,
	unserializeCrossMarginSettings,
	unserializeFuturesVolumes,
	unserializeGasEstimate,
	unserializeTradeInputs,
	unserializeMarkets,
	unserializeDelayedOrders,
	updatePositionUpnl,
	unserializePositionHistory,
	unserializeTrades,
	unserializeConditionalOrders,
} from 'utils/futures';

import { MarkPrices, futuresPositionKeys, MarkPriceInfos } from './types';

export const selectFuturesType = (state: RootState) => state.futures.selectedType;

export const selectCrossMarginAccount = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.futures.crossMargin,
	(wallet, network, crossMargin) => {
		return wallet ? crossMargin.accounts[network]?.[wallet]?.account : undefined;
	}
);

export const selectQueryStatuses = (state: RootState) => state.futures.queryStatuses;

export const selectMarketsQueryStatus = (state: RootState) => state.futures.queryStatuses.markets;

export const selectCMAccountQueryStatus = (state: RootState) =>
	state.futures.queryStatuses.crossMarginAccount;

export const selectLeverageInput = createSelector(
	(state: RootState) => state.futures,
	selectFuturesType,
	(futures, type) => futures[accountType(type)].leverageInput
);

export const selectCrossMarginMarginDelta = (state: RootState) =>
	wei(state.futures.crossMargin.marginDelta || 0);

export const selectMarginDeltaInputValue = (state: RootState) =>
	state.futures.crossMargin.marginDelta;

export const selectFuturesSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420;

export const selectCrossMarginTransferOpen = (state: RootState) =>
	state.app.openModal === 'futures_cross_deposit' ||
	state.app.openModal === 'futures_cross_withdraw';

export const selectShowCrossMarginOnboard = (state: RootState) =>
	state.app.openModal === 'futures_smart_margin_onboard';

export const selectSelectedTrader = (state: RootState) => state.futures.leaderboard.selectedTrader;

export const selectCrossMarginAccountData = createSelector(
	selectWallet,
	selectNetwork,
	selectFuturesSupportedNetwork,
	(state: RootState) => state.futures.crossMargin,
	(wallet, network, supportedNetwork, crossMargin) => {
		return wallet && supportedNetwork ? crossMargin.accounts[network][wallet] : null;
	}
);

export const selectIsolatedAccountData = createSelector(
	selectWallet,
	selectNetwork,
	selectFuturesSupportedNetwork,
	(state: RootState) => state.futures.isolatedMargin,
	(wallet, network, supportedNetwork, isolatedMargin) => {
		return wallet && supportedNetwork ? isolatedMargin.accounts[network][wallet] : null;
	}
);

export const selectAccountData = createSelector(
	selectFuturesType,
	selectCrossMarginAccountData,
	selectIsolatedAccountData,
	(type, crossAccountData, isolatedAccountData) =>
		type === 'cross_margin' ? crossAccountData : isolatedAccountData
);

export const selectCMDepositApproved = createSelector(selectCrossMarginAccountData, (account) => {
	if (!account) return false;
	return wei(account.balanceInfo.allowance || 0).gt(0);
});

export const selectCMBalance = createSelector(selectCrossMarginAccountData, (account) =>
	wei(account?.balanceInfo.freeMargin || 0)
);

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].selectedMarketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectMarketAsset = createSelector(
	(state: RootState) => state.futures,
	selectFuturesType,
	(futures, marginType) => futures[accountType(marginType)].selectedMarketAsset
);

export const selectMarkets = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => unserializeMarkets(markets)
);

export const selectMarketVolumes = createSelector(
	(state: RootState) => state.futures.dailyMarketVolumes,
	(dailyMarketVolumes) => unserializeFuturesVolumes(dailyMarketVolumes)
);

export const selectMarketKeys = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => markets.map(({ asset }) => MarketKeyByAsset[asset])
);

export const selectMarketAssets = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => markets.map(({ asset }) => asset)
);

export const selectMarketInfo = createSelector(
	selectMarkets,
	selectMarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket);
	}
);

export const selectOrderType = createSelector(
	(state: RootState) => state.futures,
	(futures) => futures[accountType(futures.selectedType)].orderType
);

export const selectMarketPrice = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		const price = prices[marketAsset];
		// Note this assumes the order type is always delayed off chain
		return price?.offChain ?? price?.onChain ?? wei(0);
	}
);

export const selectMarketPriceInfo = createSelector(
	selectMarketInfo,
	selectOffchainPricesInfo,
	(marketInfo, pricesInfo) => {
		if (!marketInfo || !pricesInfo[marketInfo.asset]) return;
		return pricesInfo[marketInfo.asset];
	}
);

export const selectSkewAdjustedPrice = createSelector(
	selectMarketPrice,
	selectMarketInfo,
	(price, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return price;
		return price
			? wei(price).mul(wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1))
			: zeroBN;
	}
);

export const selectSkewAdjustedPriceInfo = createSelector(
	selectMarketPriceInfo,
	selectMarketInfo,
	(priceInfo, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return priceInfo;
		return priceInfo
			? {
					price: wei(priceInfo.price).mul(
						wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1)
					),
					change: priceInfo?.change,
			  }
			: undefined;
	}
);

export const selectMarketPrices = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		return prices[marketAsset] ?? {};
	}
);

export const selectMarkPrices = createSelector(selectMarkets, selectPrices, (markets, prices) => {
	const markPrices: MarkPrices = {};
	return markets.reduce((acc, market) => {
		const price = prices[market.asset]?.offChain ?? wei(0);
		return {
			...acc,
			[market.marketKey]: wei(price).mul(
				wei(market.marketSkew).div(market.settings.skewScale).add(1)
			),
		};
	}, markPrices);
});

export const selectMarkPriceInfos = createSelector(
	selectMarkets,
	selectOffchainPricesInfo,
	(markets, prices) => {
		const markPrices: MarkPriceInfos = {};
		return markets.reduce((acc, market) => {
			const price = prices[market.asset]?.price ?? wei(0);
			return {
				...acc,
				[market.marketKey]: {
					price: wei(price).mul(wei(market.marketSkew).div(market.settings.skewScale).add(1)),
					change: prices[market.asset]?.change ?? null,
				},
			};
		}, markPrices);
	}
);

export const selectFuturesAccount = createSelector(
	selectFuturesType,
	selectWallet,
	selectCrossMarginAccount,
	(selectedType, wallet, crossMarginAccount) => {
		return selectedType === 'cross_margin' ? crossMarginAccount : wallet;
	}
);

export const selectAllConditionalOrders = createSelector(
	selectCrossMarginAccountData,
	(account) => {
		if (!account) return [];
		return unserializeConditionalOrders(account.conditionalOrders);
	}
);

export const selectCrossMarginPositions = createSelector(
	selectCrossMarginAccountData,
	selectAllConditionalOrders,
	(account, orders) => {
		return (
			account?.positions?.map(
				// TODO: Maybe change to explicit serializing functions to avoid casting
				(p) => {
					const pos = deserializeWeiObject(p, futuresPositionKeys) as FuturesPosition;
					const stopLoss = orders.find(
						(o) =>
							o.size.abs() === SL_TP_MAX_SIZE &&
							o.reduceOnly &&
							o.orderType === ConditionalOrderTypeEnum.STOP
					);
					const takeProfit = orders.find(
						(o) =>
							o.size.abs() === SL_TP_MAX_SIZE &&
							o.reduceOnly &&
							o.orderType === ConditionalOrderTypeEnum.LIMIT
					);
					return {
						...pos,
						stopLoss,
						takeProfit,
					};
				}
			) ?? []
		);
	}
);

export const selectPositionHistory = createSelector(
	selectFuturesType,
	selectCrossMarginAccountData,
	selectIsolatedAccountData,
	(type, crossAccountData, isolatedAccountData) => {
		if (type === 'isolated_margin') {
			return unserializePositionHistory(isolatedAccountData?.positionHistory ?? []);
		} else {
			return unserializePositionHistory(crossAccountData?.positionHistory ?? []);
		}
	}
);

export const selectSelectedMarketPositionHistory = createSelector(
	selectMarketAsset,
	selectPositionHistory,
	(marketAsset, positionHistory) => {
		return positionHistory.find(({ asset, isOpen }) => isOpen && asset === marketAsset);
	}
);

export const selectPositionHistoryForSelectedTrader = createSelector(
	selectNetwork,
	(state: RootState) => state.futures,
	(networkId, futures) => {
		const { selectedTrader } = futures.leaderboard;
		if (!selectedTrader) return [];
		const history =
			futures.leaderboard.selectedTraderPositionHistory[networkId]?.[selectedTrader] ?? [];
		return unserializePositionHistory(history);
	}
);

export const selectIsolatedMarginPositions = createSelector(
	selectMarkPrices,
	selectIsolatedAccountData,
	selectPositionHistory,
	(prices, account, positionHistory) => {
		return account?.positions?.map((p) => updatePositionUpnl(p, prices, positionHistory)) ?? [];
	}
);

export const selectFuturesPositions = createSelector(
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	(state: RootState) => state.futures.selectedType,
	(crossMarginPositions, isolatedMarginPositions, selectedType) => {
		return selectedType === 'cross_margin' ? crossMarginPositions : isolatedMarginPositions;
	}
);

export const selectActiveIsolatedPositionsCount = createSelector(
	selectIsolatedMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p.position).length;
	}
);

export const selectActiveCrossPositionsCount = createSelector(
	selectCrossMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p.position).length;
	}
);

export const selectSubmittingFuturesTx = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (
			app.transaction?.status === TransactionStatus.AwaitingExecution ||
			app.transaction?.status === TransactionStatus.Executed
		);
	}
);

export const selectIsClosingPosition = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'close_isolated' ||
				app.transaction?.type === 'close_cross_margin') &&
			submitting
		);
	}
);

export const selectIsSubmittingCrossTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'deposit_cross_margin' ||
				app.transaction?.type === 'withdraw_cross_margin') &&
			submitting
		);
	}
);

export const selectIsApprovingCrossDeposit = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'approve_cross_margin' && submitting;
	}
);

export const selectIsSubmittingIsolatedTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'deposit_isolated' ||
				app.transaction?.type === 'withdraw_isolated') &&
			submitting
		);
	}
);

export const selectIsolatedTransferError = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (app.transaction?.type === 'deposit_isolated' ||
			app.transaction?.type === 'withdraw_isolated') &&
			app.transaction?.status === TransactionStatus.Failed
			? app.transaction?.error ?? 'Transaction failed'
			: null;
	}
);

export const selectIsModifyingIsolatedPosition = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'modify_isolated' && submitting;
	}
);

export const selectIsCancellingOrder = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'cancel_delayed_isolated' && submitting;
	}
);

export const selectIsExecutingOrder = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'execute_delayed_isolated' && submitting;
	}
);

export const selectIsMarketCapReached = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].leverageSide,
	selectMarketInfo,
	selectMarketPrice,
	(leverageSide, marketInfo, marketAssetRate) => {
		const maxMarketValueUSD = marketInfo?.marketLimitUsd ?? wei(0);
		const marketSize = marketInfo?.marketSize ?? wei(0);
		const marketSkew = marketInfo?.marketSkew ?? wei(0);

		return leverageSide === PositionSide.LONG
			? marketSize.add(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
			: marketSize.sub(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD);
	}
);

export const selectPosition = createSelector(
	selectFuturesPositions,
	selectMarketInfo,
	(positions, market) => {
		const position = positions.find((p) => p.marketKey === market?.marketKey);
		return position
			? (deserializeWeiObject(position, futuresPositionKeys) as FuturesPosition)
			: undefined;
	}
);

export const selectOrderFeeCap = (state: RootState) =>
	wei(state.futures.crossMargin.orderFeeCap || '0');

export const selectLeverageSide = createSelector(
	(state: RootState) => state.futures,
	(futures) => futures[accountType(futures.selectedType)].leverageSide
);

export const selectMaxLeverage = createSelector(
	selectPosition,
	selectMarketInfo,
	selectLeverageSide,
	selectOrderType,
	selectFuturesType,
	(position, market, leverageSide, orderType, futuresType) => {
		const positionLeverage = position?.position?.leverage ?? wei(0);
		const positionSide = position?.position?.side;
		const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;
		let adjustedMaxLeverage = marketMaxLeverage.gt(APP_MAX_LEVERAGE)
			? APP_MAX_LEVERAGE
			: marketMaxLeverage;

		adjustedMaxLeverage =
			orderType === 'delayed' || orderType === 'delayed_offchain'
				? adjustedMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT)
				: adjustedMaxLeverage;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return adjustedMaxLeverage;
		if (futuresType === 'cross_margin') return adjustedMaxLeverage;
		if (positionSide === leverageSide) {
			return adjustedMaxLeverage?.sub(positionLeverage).gte(0)
				? adjustedMaxLeverage.sub(positionLeverage)
				: wei(0);
		} else {
			return positionLeverage.add(adjustedMaxLeverage).gte(0)
				? positionLeverage.add(adjustedMaxLeverage)
				: wei(0);
		}
	}
);

export const selectAboveMaxLeverage = createSelector(
	selectMaxLeverage,
	selectPosition,
	(maxLeverage, position) => {
		return position?.position?.leverage && maxLeverage.lt(position.position.leverage);
	}
);

export const selectCrossMarginBalanceInfo = createSelector(
	selectCrossMarginAccountData,
	(account) => {
		return account
			? unserializeCmBalanceInfo(account.balanceInfo)
			: {
					freeMargin: wei(0),
					keeperEthBal: wei(0),
					allowance: wei(0),
			  };
	}
);

export const selectIdleMargin = createSelector(
	selectMarketKey,
	selectCrossMarginPositions,
	selectCrossMarginBalanceInfo,
	selectSusdBalance,
	(selectedMarketKey, positions, { freeMargin }, balance) => {
		const idleInMarkets = positions
			.filter((p) => !p.position?.size.abs().gt(0) && p.marketKey !== selectedMarketKey)
			.reduce((acc, p) => acc.add(p.remainingMargin), wei(0));
		return balance.add(idleInMarkets).add(freeMargin);
	}
);

export const selectAvailableMargin = createSelector(
	selectMarketInfo,
	selectPosition,
	(marketInfo, position) => {
		if (!marketInfo || !position) return zeroBN;
		if (!position?.position) return position.remainingMargin;

		let inaccessible = position.position.notionalValue.div(marketInfo.maxLeverage).abs() ?? zeroBN;

		// If the user has a position open, we'll enforce a min initial margin requirement.
		if (inaccessible.gt(0) && inaccessible.lt(marketInfo.minInitialMargin)) {
			inaccessible = marketInfo.minInitialMargin;
		}

		// check if available margin will be less than 0
		return position.remainingMargin.sub(inaccessible).gt(0)
			? position.remainingMargin.sub(inaccessible).abs()
			: zeroBN;
	}
);

export const selectCrossMarginTradeInputs = createSelector(
	selectLeverageSide,
	(state: RootState) => state.futures.crossMargin.tradeInputs,
	(side, tradeInputs) => {
		const inputs = unserializeTradeInputs(tradeInputs);
		const deltas = {
			susdSizeDelta: side === PositionSide.LONG ? inputs.susdSize : inputs.susdSize.neg(),
			nativeSizeDelta: side === PositionSide.LONG ? inputs.nativeSize : inputs.nativeSize.neg(),
		};
		return {
			...inputs,
			...deltas,
			susdSizeString: tradeInputs.susdSize,
			nativeSizeString: tradeInputs.nativeSize,
		};
	}
);

export const selectIsolatedMarginTradeInputs = createSelector(
	selectLeverageSide,
	(state: RootState) => state.futures.isolatedMargin.tradeInputs,
	(side, tradeInputs) => {
		const inputs = unserializeTradeInputs(tradeInputs);
		const deltas = {
			susdSizeDelta: side === PositionSide.LONG ? inputs.susdSize : inputs.susdSize.neg(),
			nativeSizeDelta: side === PositionSide.LONG ? inputs.nativeSize : inputs.nativeSize.neg(),
		};
		return {
			...inputs,
			...deltas,
			susdSizeString: tradeInputs.susdSize,
			nativeSizeString: tradeInputs.nativeSize,
		};
	}
);

export const selectCrossMarginEditPosInputs = (state: RootState) =>
	state.futures.crossMargin.editPositionInputs;
export const selectIsolatedMarginEditPosInputs = (state: RootState) =>
	state.futures.crossMargin.editPositionInputs;

export const selectEditPositionInputs = createSelector(
	selectFuturesType,
	selectCrossMarginEditPosInputs,
	selectIsolatedMarginEditPosInputs,
	(type, crossMarginInputs, isolatedInputs) => {
		return type === 'cross_margin' ? crossMarginInputs : isolatedInputs;
	}
);

export const selectSelectedInputDenomination = (state: RootState) =>
	state.futures.selectedInputDenomination;

export const selectCrossMarginSelectedLeverage = createSelector(
	selectMarketKey,
	(state: RootState) => state.futures.crossMargin.selectedLeverageByAsset,
	(key, selectedLeverageByAsset) => wei(selectedLeverageByAsset[key] || DEFAULT_LEVERAGE)
);

export const selectIsolatedMarginFee = (state: RootState) =>
	wei(state.futures.isolatedMargin.tradeFee);

export const selectKeeperEthBalance = createSelector(selectCrossMarginAccountData, (account) =>
	wei(account?.balanceInfo.keeperEthBal || 0)
);

export const selectCrossMarginTradeFees = createSelector(
	(state: RootState) => state.futures.crossMargin.fees,
	(fees) => {
		return {
			staticFee: wei(fees.staticFee),
			crossMarginFee: wei(fees.crossMarginFee),
			keeperEthDeposit: wei(fees.keeperEthDeposit),
			limitStopOrderFee: wei(fees.limitStopOrderFee),
			total: wei(fees.total),
		};
	}
);

export const selectTradeSizeInputs = createSelector(
	selectFuturesType,
	selectCrossMarginTradeInputs,
	selectIsolatedMarginTradeInputs,
	(type, crossMarginInputs, isolatedInputs) => {
		return type === 'cross_margin' ? crossMarginInputs : isolatedInputs;
	}
);

export const selectSlTpTradeInputs = createSelector(
	(state: RootState) => state.futures.crossMargin.tradeInputs,
	(tradeInputs) => ({
		stopLossPrice: tradeInputs.stopLossPrice || '',
		takeProfitPrice: tradeInputs.takeProfitPrice || '',
	})
);

export const selectIsolatedPriceImpact = createSelector(
	(state: RootState) => state.futures.isolatedMargin.priceImpact,
	(priceImpact) => wei(priceImpact)
);

export const selectDesiredTradeFillPrice = createSelector(
	selectIsolatedPriceImpact,
	selectTradeSizeInputs,
	selectMarketPrice,
	(priceImpact, { nativeSizeDelta }, marketPrice) => {
		return nativeSizeDelta.lt(0)
			? marketPrice.mul(wei(1).sub(priceImpact))
			: marketPrice.mul(priceImpact.add(1));
	}
);

export const selectDesiredCloseFillPrice = createSelector(
	selectIsolatedPriceImpact,
	selectPosition,
	selectMarketPrice,
	(priceImpact, position, marketPrice) => {
		return position?.position?.side === PositionSide.LONG
			? marketPrice.mul(wei(1).sub(priceImpact))
			: marketPrice.mul(priceImpact.add(1));
	}
);

export const selectCrossMarginOrderPrice = (state: RootState) =>
	state.futures.crossMargin.orderPrice.price ?? '';

export const selectIsolatedMarginLeverage = createSelector(
	selectPosition,
	selectIsolatedMarginTradeInputs,
	(position, { susdSize }) => {
		const remainingMargin = position?.remainingMargin;
		if (!remainingMargin || remainingMargin.eq(0) || !susdSize) return wei(0);
		return susdSize.div(remainingMargin);
	}
);

export const selectNextPriceDisclaimer = createSelector(
	selectMaxLeverage,
	selectLeverageInput,
	(maxLeverage, leverage) => {
		return wei(leverage || 0).gte(maxLeverage.sub(wei(1))) && wei(leverage || 0).lte(maxLeverage);
	}
);

export const selectPlaceOrderTranslationKey = createSelector(
	selectPosition,
	selectCrossMarginMarginDelta,
	selectCrossMarginBalanceInfo,
	selectFuturesType,
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].orderType,
	selectIsMarketCapReached,
	(position, marginDelta, { freeMargin }, selectedType, orderType, isMarketCapReached) => {
		let remainingMargin;
		if (selectedType === 'isolated_margin') {
			remainingMargin = position?.remainingMargin || zeroBN;
		} else {
			remainingMargin = marginDelta;
		}

		if (orderType === 'delayed' || orderType === 'delayed_offchain')
			return 'futures.market.trade.button.place-delayed-order';
		if (orderType === 'limit') return 'futures.market.trade.button.place-limit-order';
		if (orderType === 'stop_market') return 'futures.market.trade.button.place-stop-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return remainingMargin.add(freeMargin).lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	}
);

export const selectFuturesPortfolio = createSelector(
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	selectCrossMarginBalanceInfo,
	(crossPositions, isolatedPositions, { freeMargin }) => {
		const isolatedValue =
			isolatedPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0);
		const crossValue =
			crossPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0);
		const totalValue = isolatedValue.add(crossValue).add(freeMargin);

		return {
			total: totalValue,
			crossMarginFutures: crossValue.add(freeMargin),
			isolatedMarginFutures: isolatedValue,
		};
	}
);

export const selectMarginTransfers = createSelector(
	selectWallet,
	selectNetwork,
	selectFuturesType,
	selectMarketAsset,
	(state: RootState) => state.futures,
	(wallet, network, type, asset, futures) => {
		if (!wallet) return [];
		const account = futures[accountType(type)].accounts[network]?.[wallet];
		const marginTransfers = account?.marginTransfers ?? [];
		return marginTransfers.filter(
			(o) => accountType(type) === 'isolatedMargin' && o.asset === asset
		);
	}
);

export const selectConditionalOrdersForMarket = createSelector(
	selectMarketAsset,
	selectCrossMarginAccountData,
	(asset, account) => {
		const orders = account ? unserializeConditionalOrders(account.conditionalOrders) : [];
		return orders.filter((o) => o.asset === asset);
	}
);

export const selectOpenDelayedOrders = createSelector(selectAccountData, (account) =>
	unserializeDelayedOrders(account?.delayedOrders ?? [])
);

export const selectTradePreview = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		const preview = futures[accountType(type)].tradePreview;
		return preview ? unserializePotentialTrade(preview) : null;
	}
);

export const selectTradePreviewError = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginTradePreview.error
			: futures.queryStatuses.isolatedTradePreview.error;
	}
);

export const selectIsFetchingTradePreview = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginTradePreview.status === FetchStatus.Loading
			: futures.queryStatuses.isolatedTradePreview.status === FetchStatus.Loading;
	}
);

export const selectModifyPositionError = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return app.transaction?.type === 'modify_isolated' && app.transaction?.error
			? getKnownError(app.transaction.error)
			: null;
	}
);

export const selectTradePreviewStatus = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginTradePreview
			: futures.queryStatuses.isolatedTradePreview;
	}
);

export const selectPositionStatus = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginPositions
			: futures.queryStatuses.isolatedPositions;
	}
);

export const selectOpenConditionalOrders = createSelector(
	selectConditionalOrdersForMarket,
	selectFuturesType,
	(crossOrders, futuresType) => {
		return futuresType === 'cross_margin' ? crossOrders : [];
	}
);

export const selectStopLossOrder = createSelector(
	selectOpenConditionalOrders,
	selectMarketKey,
	(selectOpenConditionalOrders, marketKey) => {
		return selectOpenConditionalOrders.find(
			(o) =>
				o.marketKey === marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT && o.reduceOnly
		);
	}
);

export const selectTakeProfitOrder = createSelector(
	selectOpenConditionalOrders,
	selectMarketKey,
	(selectOpenConditionalOrders, marketKey) => {
		return selectOpenConditionalOrders.find(
			(o) =>
				o.marketKey === marketKey && o.orderType === ConditionalOrderTypeEnum.STOP && o.reduceOnly
		);
	}
);

export const selectPendingDelayedOrder = createSelector(
	selectConditionalOrdersForMarket,
	selectOpenDelayedOrders,
	selectFuturesType,
	selectMarketKey,
	(crossOrders, isolatedOrder, futuresType, marketKey) => {
		if (futuresType === 'cross_margin') {
			return crossOrders.find((o) => o.marketKey === marketKey);
		}
		return isolatedOrder.find((o) => o.marketKey === marketKey);
	}
);

export const selectCrossMarginSettings = createSelector(
	(state: RootState) => state.futures.crossMargin.settings,
	(settings) => unserializeCrossMarginSettings(settings)
);

export const selectIsConditionalOrder = createSelector(
	(state: RootState) => state.futures.crossMargin.orderType,
	(type) => type === 'limit' || type === 'stop_market'
);

export const selectModifyIsolatedGasEstimate = createSelector(
	(state: RootState) => state.futures.transactionEstimations,
	(transactionEstimations) => {
		const estimate = transactionEstimations['modify_isolated'];
		if (estimate) return unserializeGasEstimate(estimate);
		return null;
	}
);

export const selectDelayedOrderFee = createSelector(
	selectMarketInfo,
	selectTradeSizeInputs,
	selectSkewAdjustedPrice,
	selectOrderType,
	(market, { nativeSizeDelta }, price, orderType) => {
		if (
			!market?.marketSkew ||
			!market?.feeRates.takerFeeDelayedOrder ||
			!market?.feeRates.makerFeeDelayedOrder ||
			!market?.feeRates.takerFeeOffchainDelayedOrder ||
			!market?.feeRates.makerFeeOffchainDelayedOrder ||
			!nativeSizeDelta
		) {
			return { commitDeposit: undefined, delayedOrderFee: undefined };
		}

		const notionalDiff = nativeSizeDelta.mul(price);

		const makerFee =
			orderType === 'delayed_offchain'
				? market.feeRates.makerFeeOffchainDelayedOrder
				: market.feeRates.makerFeeDelayedOrder;
		const takerFee =
			orderType === 'delayed_offchain'
				? market.feeRates.takerFeeOffchainDelayedOrder
				: market.feeRates.takerFeeDelayedOrder;

		const staticRate = sameSide(notionalDiff, market.marketSkew) ? takerFee : makerFee;

		return {
			commitDeposit: notionalDiff.mul(staticRate).abs(),
			delayedOrderFee: notionalDiff.mul(staticRate).abs(),
		};
	}
);

export const selectOpenInterest = createSelector(selectMarkets, (futuresMarkets) =>
	futuresMarkets.reduce(
		(total, { openInterest }) => total.add(openInterest.shortUSD).add(openInterest.longUSD),
		wei(0)
	)
);

export const selectUsersTradesForMarket = createSelector(
	selectMarketAsset,
	selectAccountData,
	(asset, accountData) => {
		const trades = unserializeTrades(accountData?.trades ?? []);
		return trades?.filter((t) => t.asset === formatBytes32String(asset)) ?? [];
	}
);

export const selectAllUsersTrades = createSelector(selectAccountData, (accountData) =>
	unserializeTrades(accountData?.trades ?? [])
);

export const selectCancellingConditionalOrder = (state: RootState) =>
	state.futures.crossMargin.cancellingOrder;

export const selectHasRemainingMargin = createSelector(
	selectPosition,
	selectFuturesType,
	selectCrossMarginBalanceInfo,
	(position, futuresType, balanceInfo) => {
		const posMargin = position?.remainingMargin ?? zeroBN;
		return futuresType === 'cross_margin'
			? balanceInfo.freeMargin.add(posMargin).gt(0)
			: posMargin.gt(0);
	}
);

export const selectOrderFee = createSelector(
	selectMarketInfo,
	selectTradeSizeInputs,
	selectOrderType,
	(marketInfo, { susdSizeDelta }, orderType) => {
		return computeOrderFee(marketInfo, susdSizeDelta, orderType);
	}
);

export const selectMaxUsdSizeInput = createSelector(
	selectFuturesType,
	selectPosition,
	selectMaxLeverage,
	selectMarginDeltaInputValue,
	(futuresType, position, maxLeverage, marginDelta) => {
		const margin =
			futuresType === 'cross_margin' ? marginDelta || 0 : position?.remainingMargin ?? wei(0);
		return maxLeverage.mul(margin);
	}
);

export const selectAvailableOi = createSelector(selectMarketInfo, (marketInfo) => {
	const availableOiUsdShort =
		marketInfo?.marketLimitUsd.sub(marketInfo.openInterest.shortUSD) ?? wei(0);

	const availableOiUsdLong =
		marketInfo?.marketLimitUsd.sub(marketInfo.openInterest.longUSD) ?? wei(0);

	const availableOiNativeShort =
		marketInfo?.marketLimitNative.sub(marketInfo.openInterest.short) ?? wei(0);

	const availableOiNativeLong =
		marketInfo?.marketLimitNative.sub(marketInfo.openInterest.long) ?? wei(0);

	return {
		short: {
			usd: availableOiUsdShort,
			native: availableOiNativeShort,
		},
		long: {
			usd: availableOiUsdLong,
			native: availableOiNativeLong,
		},
	};
});

export const selectPreviewAvailableMargin = createSelector(
	selectMarketInfo,
	selectTradePreview,
	selectDelayedOrderFee,
	(marketInfo, tradePreview, delayedOrderFee) => {
		if (!marketInfo || !tradePreview) return zeroBN;

		let inaccessible = tradePreview.notionalValue.div(marketInfo.maxLeverage).abs() ?? zeroBN;
		const totalDeposit = !!delayedOrderFee.commitDeposit
			? delayedOrderFee.commitDeposit.add(marketInfo.keeperDeposit)
			: zeroBN;

		// If the user has a position open, we'll enforce a min initial margin requirement.
		if (inaccessible.gt(0) && inaccessible.lt(marketInfo.minInitialMargin)) {
			inaccessible = marketInfo.minInitialMargin;
		}

		// check if available margin will be less than 0
		return tradePreview.margin.sub(inaccessible).sub(totalDeposit).gt(0)
			? tradePreview.margin.sub(inaccessible).sub(totalDeposit).abs()
			: zeroBN;
	}
);

export const selectAverageEntryPrice = createSelector(
	selectTradePreview,
	selectSelectedMarketPositionHistory,
	(tradePreview, positionHistory) => {
		if (positionHistory && tradePreview) {
			const { avgEntryPrice, side, size } = positionHistory;
			const currentSize = side === PositionSide.SHORT ? size.neg() : size;

			// If the trade switched sides (long -> short or short -> long), use oracle price
			if (currentSize.mul(tradePreview.size).lt(0)) return tradePreview.price;

			// If the trade reduced position size on the same side, average entry remains the same
			if (tradePreview.size.abs().lt(size)) return avgEntryPrice;

			// If the trade increased position size on the same side, calculate new average
			const existingValue = avgEntryPrice.mul(size);
			const newValue = tradePreview.price.mul(tradePreview.sizeDelta.abs());
			const totalValue = existingValue.add(newValue);
			return totalValue.div(tradePreview.size.abs());
		}
		return null;
	}
);

type PositionPreviewData = {
	fillPrice: Wei;
	sizeIsNotZero: boolean;
	positionSide: string;
	positionSize: Wei;
	leverage: Wei;
	liquidationPrice: Wei;
	avgEntryPrice: Wei;
	notionalValue: Wei;
	showStatus: boolean;
};

export const selectPreviewData = createSelector(
	selectTradePreview,
	selectPosition,
	selectAverageEntryPrice,
	(tradePreview, position, modifiedAverage) => {
		if (!position?.position || tradePreview === null) {
			return null;
		}

		return {
			fillPrice: tradePreview.price,
			sizeIsNotZero: tradePreview.size && !tradePreview.size?.eq(0),
			positionSide: tradePreview.size?.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			positionSize: tradePreview.size?.abs(),
			notionalValue: tradePreview.notionalValue,
			leverage: tradePreview.margin.gt(0)
				? tradePreview.notionalValue.div(tradePreview.margin).abs()
				: zeroBN,
			liquidationPrice: tradePreview.liqPrice,
			avgEntryPrice: modifiedAverage || zeroBN,
			showStatus: tradePreview.showStatus,
		} as PositionPreviewData;
	}
);

export const selectPreviewTradeData = createSelector(
	selectTradePreview,
	selectPreviewAvailableMargin,
	selectMarketInfo,
	(tradePreview, previewAvailableMargin, marketInfo) => {
		const potentialMarginUsage = tradePreview?.margin.gt(0)
			? tradePreview!.margin.sub(previewAvailableMargin).div(tradePreview!.margin).abs() ?? zeroBN
			: zeroBN;

		const maxPositionSize =
			!!tradePreview && !!marketInfo
				? tradePreview.margin
						.mul(marketInfo.maxLeverage)
						.mul(tradePreview.side === PositionSide.LONG ? 1 : -1)
				: null;

		const potentialBuyingPower = !!maxPositionSize
			? maxPositionSize.sub(tradePreview?.notionalValue).abs()
			: zeroBN;

		return {
			showPreview: !!tradePreview && tradePreview.sizeDelta.abs().gt(0),
			totalMargin: tradePreview?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}
);

export const selectCrossPreviewCount = (state: RootState) =>
	state.futures.crossMargin.previewDebounceCount;

export const selectIsolatedPreviewCount = (state: RootState) =>
	state.futures.isolatedMargin.previewDebounceCount;

export const selectBuyingPower = createSelector(
	selectPosition,
	selectMaxLeverage,
	(position, maxLeverage) => {
		const totalMargin = position?.remainingMargin ?? zeroBN;
		return totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;
	}
);

export const selectMarginUsage = createSelector(
	selectAvailableMargin,
	selectPosition,
	(availableMargin, position) => {
		const totalMargin = position?.remainingMargin ?? zeroBN;
		return availableMargin.gt(zeroBN)
			? totalMargin.sub(availableMargin).div(totalMargin)
			: totalMargin.gt(zeroBN)
			? wei(1)
			: zeroBN;
	}
);

export const selectMarketSuspended = createSelector(
	selectMarketInfo,
	(marketInfo) => marketInfo?.isSuspended
);

export const selectClosePositionOrderFee = createSelector(
	(state: RootState) => state.futures.closePositionOrderFee,
	wei
);

export const selectClosePositionOrderFeeError = (state: RootState) =>
	state.futures.queryStatuses.closePositionOrderFee.error;
