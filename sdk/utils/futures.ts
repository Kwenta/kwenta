import Wei, { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { parseBytes32String } from 'ethers/lib/utils.js';

import { ETH_UNIT } from 'constants/network';
import { FuturesAggregateStatResult } from 'queries/futures/subgraph';
import { FUTURES_ENDPOINTS, MAINNET_MARKETS, TESTNET_MARKETS } from 'sdk/constants/futures';
import { SECONDS_PER_DAY } from 'sdk/constants/period';
import {
	FundingRateUpdate,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrder,
	FuturesPosition,
	FuturesPotentialTradeDetails,
	FuturesVolumes,
	MarketClosureReason,
	PositionDetail,
	PositionSide,
	PostTradeDetailsResponse,
	PotentialTradeStatus,
} from 'sdk/types/futures';
import {
	CrossMarginOrderType,
	CrossMarginSettings,
	IsolatedMarginOrderType,
} from 'state/futures/types';
import { formatCurrency, formatDollars, zeroBN } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

export const getFuturesEndpoint = (networkId: number): string => {
	return FUTURES_ENDPOINTS[networkId] || FUTURES_ENDPOINTS[10];
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
			logError('Futures is not supported on this network.');
			return [];
	}
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
		(acc: FuturesVolumes, { asset, volume, trades }) => {
			return {
				...acc,
				[asset]: {
					volume: volume.div(ETH_UNIT).add(acc[asset]?.volume ?? 0),
					trades: trades.add(acc[asset]?.trades ?? 0),
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
});

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
	INVALID_PRICE: 'Invalid price',
	PRICE_OUT_OF_BOUNDS: 'Price out of acceptable range',
	CAN_LIQUIDATE: 'Position can be liquidated',
	CANNOT_LIQUIDATE: 'Position cannot be liquidated',
	MAX_MARKET_SIZE_EXCEEDED: 'Max market size exceeded',
	MAX_LEVERAGE_EXCEEDED: 'Max leverage exceeded',
	INSUFFICIENT_MARGIN: 'Insufficient margin',
	NOT_PERMITTED: 'Not permitted by this address',
	NIL_ORDER: 'Cannot submit empty order',
	NO_POSITION_OPEN: 'No position open',
	PRICE_TOO_VOLATILE: 'Price too volatile',
	INSUFFICIENT_FREE_MARGIN: 'Insufficient free margin',
};

export const calculateCrossMarginFee = (
	orderType: CrossMarginOrderType | IsolatedMarginOrderType,
	susdSize: Wei,
	feeRates: CrossMarginSettings
) => {
	if (orderType !== 'limit' && orderType !== 'stop market') return zeroBN;
	const advancedOrderFeeRate =
		orderType === 'limit' ? feeRates.limitOrderFee : feeRates.stopOrderFee;
	return susdSize.mul(advancedOrderFeeRate);
};

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
