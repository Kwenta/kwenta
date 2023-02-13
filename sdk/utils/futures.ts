import { NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { parseBytes32String } from 'ethers/lib/utils.js';

import { ETH_UNIT } from 'constants/network';
import {
	FuturesAggregateStatResult,
	FuturesOrderType as SubgraphOrderType,
	FuturesPositionResult,
	FuturesTradeResult,
	FuturesMarginTransferResult,
	CrossMarginAccountTransferResult,
} from 'queries/futures/subgraph';
import {
	FUTURES_ENDPOINTS,
	MAINNET_MARKETS,
	TESTNET_MARKETS,
	AGGREGATE_ASSET_KEY,
	MAIN_ENDPOINTS,
} from 'sdk/constants/futures';
import { SECONDS_PER_DAY } from 'sdk/constants/period';
import { IPerpsV2MarketConsolidated } from 'sdk/contracts/types/PerpsV2Market';
import {
	DelayedOrder,
	CrossMarginOrderType,
	FundingRateUpdate,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrder,
	FuturesOrderType,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	IsolatedMarginOrderType,
	MarketClosureReason,
	PositionDetail,
	PositionSide,
	PostTradeDetailsResponse,
	PotentialTradeStatus,
	MarginTransfer,
} from 'sdk/types/futures';
import { CrossMarginSettings } from 'state/futures/types';
import { formatCurrency, formatDollars, zeroBN } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

export const getFuturesEndpoint = (networkId: number): string => {
	return FUTURES_ENDPOINTS[networkId] || FUTURES_ENDPOINTS[10];
};

export const getMainEndpoint = (networkId: number): string => {
	return MAIN_ENDPOINTS[networkId] || MAIN_ENDPOINTS[10];
};

export const calculateFundingRate = (
	minTimestamp: number,
	periodLength: number,
	fundingRates: FundingRateUpdate[],
	assetPrice: Wei,
	currentFundingRate: Wei
): Wei | null => {
	const numUpdates = fundingRates.length;
	if (numUpdates < 2) return null;

	// variables to keep track
	let fundingPaid = wei(0);
	let timeTotal = 0;
	let lastTimestamp = minTimestamp;

	// iterate through funding updates
	for (let ind = 0; ind < numUpdates - 1; ind++) {
		const minFunding = fundingRates[ind];
		const maxFunding = fundingRates[ind + 1];

		const fundingStart = new Wei(minFunding.funding, 18, true);
		const fundingEnd = new Wei(maxFunding.funding, 18, true);

		const fundingDiff = fundingStart.sub(fundingEnd);
		const timeDiff = maxFunding.timestamp - Math.max(minFunding.timestamp, lastTimestamp);
		const timeMax = maxFunding.timestamp - minFunding.timestamp;

		if (timeMax > 0) {
			fundingPaid = fundingPaid.add(fundingDiff.mul(timeDiff).div(timeMax));
			timeTotal += timeDiff;
		}
		lastTimestamp = maxFunding.timestamp;
	}

	// add funding from current rate
	const timeLeft = Math.max(periodLength - timeTotal, 0);
	if (timeLeft > 0) {
		fundingPaid = fundingPaid.add(
			wei(currentFundingRate).mul(timeLeft).div(SECONDS_PER_DAY).mul(assetPrice)
		);
	}

	const fundingRate = fundingPaid.div(assetPrice);
	return fundingRate;
};

export const marketsForNetwork = (networkId: number) => {
	switch (networkId) {
		case 10:
			return MAINNET_MARKETS;
		case 420:
			return TESTNET_MARKETS;
		default:
			logError(new Error('Futures is not supported on this network.'));
			return [];
	}
};

export const getMarketName = (asset: FuturesMarketAsset | null) => {
	return `${getDisplayAsset(asset)}-PERP`;
};

export const getDisplayAsset = (asset: string | null) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};

export const getReasonFromCode = (
	reasonCode?: BigNumber
): MarketClosureReason | 'unknown' | null => {
	switch (Number(reasonCode)) {
		case 1:
			return 'system-upgrade';
		case 2:
			return 'market-closure';
		case 3:
		case 55:
		case 65:
		case 231:
			return 'circuit-breaker';
		case 99999:
			return 'emergency';
		default:
			return 'unknown';
	}
};

export const calculateVolumes = (
	futuresHourlyStats: FuturesAggregateStatResult[]
): FuturesVolumes => {
	const volumes: FuturesVolumes = futuresHourlyStats.reduce(
		(acc: FuturesVolumes, { marketKey, volume, trades }) => {
			const cleanMarketKey =
				marketKey !== AGGREGATE_ASSET_KEY ? parseBytes32String(marketKey) : marketKey;
			return {
				...acc,
				[cleanMarketKey]: {
					volume: volume.div(ETH_UNIT).add(acc[cleanMarketKey]?.volume ?? 0),
					trades: trades.add(acc[cleanMarketKey]?.trades ?? 0),
				},
			};
		},
		{}
	);
	return volumes;
};

export const mapFuturesPosition = (
	positionDetail: PositionDetail,
	canLiquidatePosition: boolean,
	asset: FuturesMarketAsset,
	marketKey: FuturesMarketKey
): FuturesPosition => {
	const {
		remainingMargin,
		accessibleMargin,
		position: { fundingIndex, lastPrice, size, margin },
		accruedFunding,
		notionalValue,
		liquidationPrice,
		profitLoss,
	} = positionDetail;
	const initialMargin = wei(margin);
	const pnl = wei(profitLoss).add(wei(accruedFunding));
	const pnlPct = initialMargin.gt(0) ? pnl.div(wei(initialMargin)) : wei(0);

	return {
		asset,
		marketKey,
		remainingMargin: wei(remainingMargin),
		accessibleMargin: wei(accessibleMargin),
		position: wei(size).eq(zeroBN)
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					side: wei(size).gt(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					notionalValue: wei(notionalValue).abs(),
					accruedFunding: wei(accruedFunding),
					initialMargin,
					profitLoss: wei(profitLoss),
					fundingIndex: Number(fundingIndex),
					lastPrice: wei(lastPrice),
					size: wei(size).abs(),
					liquidationPrice: wei(liquidationPrice),
					initialLeverage: initialMargin.gt(0)
						? wei(size).mul(wei(lastPrice)).div(initialMargin).abs()
						: wei(0),
					pnl,
					pnlPct,
					marginRatio: wei(notionalValue).eq(zeroBN)
						? zeroBN
						: wei(remainingMargin).div(wei(notionalValue).abs()),
					leverage: wei(remainingMargin).eq(zeroBN)
						? zeroBN
						: wei(notionalValue).div(wei(remainingMargin)).abs(),
			  },
	};
};

export const mapFuturesPositions = (
	futuresPositions: FuturesPositionResult[]
): FuturesPositionHistory[] => {
	return futuresPositions.map(
		({
			id,
			lastTxHash,
			openTimestamp,
			closeTimestamp,
			timestamp,
			market,
			asset,
			marketKey,
			account,
			abstractAccount,
			accountType,
			isOpen,
			isLiquidated,
			trades,
			totalVolume,
			size,
			initialMargin,
			margin,
			pnl,
			feesPaid,
			netFunding,
			pnlWithFeesPaid,
			netTransfers,
			totalDeposits,
			entryPrice,
			avgEntryPrice,
			exitPrice,
		}: FuturesPositionResult) => {
			const entryPriceWei = wei(entryPrice).div(ETH_UNIT);
			const feesWei = wei(feesPaid || 0).div(ETH_UNIT);
			const sizeWei = wei(size).div(ETH_UNIT);
			const marginWei = wei(margin).div(ETH_UNIT);
			return {
				id: Number(id.split('-')[1].toString()),
				transactionHash: lastTxHash,
				timestamp: timestamp.mul(1000).toNumber(),
				openTimestamp: openTimestamp.mul(1000).toNumber(),
				closeTimestamp: closeTimestamp?.mul(1000).toNumber(),
				market,
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				marketKey: parseBytes32String(marketKey) as FuturesMarketKey,
				account,
				abstractAccount,
				accountType,
				isOpen,
				isLiquidated,
				size: sizeWei.abs(),
				feesPaid: feesWei,
				netFunding: wei(netFunding || 0).div(ETH_UNIT),
				netTransfers: wei(netTransfers || 0).div(ETH_UNIT),
				totalDeposits: wei(totalDeposits || 0).div(ETH_UNIT),
				initialMargin: wei(initialMargin).div(ETH_UNIT),
				margin: marginWei,
				entryPrice: entryPriceWei,
				exitPrice: wei(exitPrice || 0).div(ETH_UNIT),
				pnl: wei(pnl).div(ETH_UNIT),
				pnlWithFeesPaid: wei(pnlWithFeesPaid).div(ETH_UNIT),
				totalVolume: wei(totalVolume).div(ETH_UNIT),
				trades: trades.toNumber(),
				avgEntryPrice: wei(avgEntryPrice).div(ETH_UNIT),
				leverage: marginWei.eq(wei(0)) ? wei(0) : sizeWei.mul(entryPriceWei).div(marginWei).abs(),
				side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
			};
		}
	);
};

export const serializePotentialTrade = (
	preview: FuturesPotentialTradeDetails
): FuturesPotentialTradeDetails<string> => ({
	...preview,
	size: preview.size.toString(),
	sizeDelta: preview.sizeDelta.toString(),
	liqPrice: preview.liqPrice.toString(),
	margin: preview.margin.toString(),
	price: preview.price.toString(),
	fee: preview.fee.toString(),
	leverage: preview.leverage.toString(),
	notionalValue: preview.notionalValue.toString(),
	priceImpact: preview.priceImpact.toString(),
	slippageAmount: preview.slippageAmount.toString(),
});

export const unserializePotentialTrade = (
	preview: FuturesPotentialTradeDetails<string>
): FuturesPotentialTradeDetails => ({
	...preview,
	size: wei(preview.size),
	sizeDelta: wei(preview.sizeDelta),
	liqPrice: wei(preview.liqPrice),
	margin: wei(preview.margin),
	price: wei(preview.price),
	fee: wei(preview.fee),
	leverage: wei(preview.leverage),
	notionalValue: wei(preview.notionalValue),
	priceImpact: wei(preview.priceImpact),
	slippageAmount: wei(preview.slippageAmount),
});

export const formatDelayedOrder = (
	account: string,
	marketAddress: string,
	order: IPerpsV2MarketConsolidated.DelayedOrderStructOutput
): DelayedOrder => {
	const {
		isOffchain,
		sizeDelta,
		priceImpactDelta,
		targetRoundId,
		commitDeposit,
		keeperDeposit,
		executableAtTime,
		intentionTime,
	} = order;

	return {
		account: account,
		marketAddress: marketAddress,
		size: wei(sizeDelta),
		commitDeposit: wei(commitDeposit),
		keeperDeposit: wei(keeperDeposit),
		submittedAtTimestamp: intentionTime.toNumber() * 1000,
		executableAtTimestamp: executableAtTime.toNumber() * 1000,
		isOffchain: isOffchain,
		priceImpactDelta: wei(priceImpactDelta),
		targetRoundId: wei(targetRoundId),
		orderType: isOffchain ? 'Delayed Offchain' : 'Delayed',
		side: wei(sizeDelta).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
	};
};

export const formatPotentialIsolatedTrade = (
	preview: PostTradeDetailsResponse,
	basePrice: Wei,
	nativeSizeDelta: Wei,
	leverageSide: PositionSide
) => {
	const { fee, liqPrice, margin, price, size, status } = preview;

	const tradeValueWithoutSlippage = wei(nativeSizeDelta).abs().mul(wei(basePrice));
	const notionalValue = wei(size).mul(wei(basePrice));
	const leverage = notionalValue.div(wei(margin));

	const priceImpact = wei(price).sub(basePrice).div(basePrice);
	const slippageDirection = nativeSizeDelta.gt(0)
		? priceImpact.gt(0)
			? -1
			: nativeSizeDelta.lt(0)
			? priceImpact.lt(0)
			: -1
		: 1;

	return {
		fee: wei(fee),
		liqPrice: wei(liqPrice),
		margin: wei(margin),
		price: wei(price),
		size: wei(size),
		sizeDelta: nativeSizeDelta,
		side: leverageSide,
		leverage: leverage,
		notionalValue: notionalValue,
		status,
		showStatus: status > 0, // 0 is success
		statusMessage: getTradeStatusMessage(status),
		priceImpact: priceImpact,
		slippageAmount: priceImpact.mul(slippageDirection).mul(tradeValueWithoutSlippage),
	};
};

export const formatPotentialTrade = (
	preview: PostTradeDetailsResponse,
	nativeSizeDelta: Wei,
	leverageSide: PositionSide
) => {
	const { fee, liqPrice, margin, price, size, status } = preview;

	return {
		fee: wei(fee),
		liqPrice: wei(liqPrice),
		margin: wei(margin),
		price: wei(price),
		size: wei(size),
		sizeDelta: nativeSizeDelta,
		side: leverageSide,
		leverage: wei(margin).eq(0) ? wei(0) : wei(size).mul(wei(price)).div(wei(margin)).abs(),
		notionalValue: wei(size).mul(wei(price)),
		status,
		showStatus: status > 0, // 0 is success
		statusMessage: getTradeStatusMessage(status),
		priceImpact: wei(0),
		slippageAmount: wei(0),
	};
};

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

export const getTradeStatusMessage = (status: PotentialTradeStatus): string => {
	if (typeof status !== 'number') {
		return UNKNOWN;
	}

	if (status === 0) {
		return SUCCESS;
	} else if (PotentialTradeStatus[status]) {
		return POTENTIAL_TRADE_STATUS_TO_MESSAGE[PotentialTradeStatus[status]];
	} else {
		return UNKNOWN;
	}
};

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/PerpsV2MarketBase.sol#L130-L141
export const POTENTIAL_TRADE_STATUS_TO_MESSAGE: { [key: string]: string } = {
	OK: 'Ok',
	INVALID_PRICE: 'Invalid price',
	INVALID_ORDER_PRICE: 'Invalid order price',
	PRICE_OUT_OF_BOUNDS: 'Price out of acceptable range',
	CAN_LIQUIDATE: 'Position can be liquidated',
	CANNOT_LIQUIDATE: 'Position cannot be liquidated',
	MAX_MARKET_SIZE_EXCEEDED: 'Max market size exceeded',
	MAX_LEVERAGE_EXCEEDED: 'Max leverage exceeded',
	INSUFFICIENT_MARGIN: 'Insufficient margin',
	NOT_PERMITTED: 'Not permitted by this address',
	NO_POSITION_OPEN: 'No position open',
	PRICE_TOO_VOLATILE: 'Price too volatile',
	PRICE_IMPACT_TOLERANCE_EXCEEDED: 'Price impact tolerance exceeded',
	INSUFFICIENT_FREE_MARGIN: 'Insufficient free margin',
};

export const calculateCrossMarginFee = (
	orderType: CrossMarginOrderType | IsolatedMarginOrderType,
	susdSize: Wei,
	feeRates: CrossMarginSettings
) => {
	if (orderType !== 'limit' && orderType !== 'stop_market') return zeroBN;
	const advancedOrderFeeRate =
		orderType === 'limit' ? feeRates.limitOrderFee : feeRates.stopOrderFee;
	return susdSize.mul(advancedOrderFeeRate);
};

export const getPythNetworkUrl = (networkId: NetworkId) => {
	return networkId === 420 ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
};

export const normalizePythId = (id: string) => (id.startsWith('0x') ? id : '0x' + id);
export const mapFuturesOrderFromEvent = (
	orderDetails: {
		id: number;
		marketKey: string;
		orderType: number;
		targetPrice: BigNumber;
		sizeDelta: BigNumber;
		marginDelta: BigNumber;
	},
	account: string
): FuturesOrder => {
	const marketKey = parseBytes32String(orderDetails.marketKey) as FuturesMarketKey;
	const asset = MarketAssetByKey[marketKey];
	const sizeDelta = wei(orderDetails.sizeDelta);
	const size = sizeDelta.abs();
	return {
		contractId: orderDetails.id,
		id: `CM-${account}-${orderDetails.id}`,
		account: account,
		size: sizeDelta,
		marginDelta: wei(orderDetails.marginDelta),
		orderType: orderDetails.orderType === 0 ? 'Limit' : 'Stop Market',
		targetPrice: wei(orderDetails.targetPrice),
		sizeTxt: formatCurrency(asset, size, {
			currencyKey: getDisplayAsset(asset) ?? '',
			minDecimals: size.lt(0.01) ? 4 : 2,
		}),
		targetPriceTxt: formatDollars(wei(orderDetails.targetPrice)),
		marketKey: marketKey,
		market: getMarketName(asset),
		asset: asset,
		targetRoundId: wei(0), // Only used for next price which is no longer supported
		side: sizeDelta.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
		isStale: false,
		isExecutable: false,
	};
};

export const OrderNameByType: Record<FuturesOrderType, FuturesOrderTypeDisplay> = {
	market: 'Market',
	delayed: 'Delayed',
	delayed_offchain: 'Delayed Offchain',
	stop_market: 'Stop Market',
	limit: 'Limit',
};

const mapOrderType = (orderType: Partial<SubgraphOrderType>): FuturesOrderTypeDisplay => {
	return orderType === 'NextPrice'
		? 'Next Price'
		: orderType === 'StopMarket'
		? 'Stop Market'
		: orderType === 'DelayedOffchain'
		? 'Delayed Offchain'
		: orderType;
};

export const mapTrades = (futuresTrades: FuturesTradeResult[]): FuturesTrade[] => {
	return futuresTrades?.map(
		({
			id,
			timestamp,
			size,
			price,
			asset,
			positionSize,
			positionClosed,
			pnl,
			feesPaid,
			orderType,
			accountType,
		}: FuturesTradeResult) => {
			return {
				asset,
				accountType,
				size: new Wei(size, 18, true),
				price: new Wei(price, 18, true),
				txnHash: id.split('-')[0].toString(),
				timestamp: timestamp,
				positionSize: new Wei(positionSize, 18, true),
				positionClosed,
				side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
				pnl: new Wei(pnl, 18, true),
				feesPaid: new Wei(feesPaid, 18, true),
				orderType: mapOrderType(orderType),
			};
		}
	);
};

export const mapMarginTransfers = (
	marginTransfers: FuturesMarginTransferResult[]
): MarginTransfer[] => {
	return marginTransfers?.map(
		({
			timestamp,
			account,
			market,
			size,
			asset,
			txHash,
		}: FuturesMarginTransferResult): MarginTransfer => {
			const sizeWei = new Wei(size);
			const numTimestamp = wei(timestamp).toNumber();

			return {
				timestamp: numTimestamp,
				account,
				market,
				size: sizeWei.div(ETH_UNIT).toNumber(),
				action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				txHash,
			};
		}
	);
};

export const mapCrossMarginTransfers = (
	marginTransfers: CrossMarginAccountTransferResult[]
): MarginTransfer[] => {
	return marginTransfers?.map(
		({ timestamp, account, size, txHash }: CrossMarginAccountTransferResult): MarginTransfer => {
			const sizeWei = new Wei(size);
			const numTimestamp = wei(timestamp).toNumber();

			return {
				timestamp: numTimestamp,
				account,
				size: sizeWei.div(ETH_UNIT).toNumber(),
				action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
				txHash,
			};
		}
	);
};
