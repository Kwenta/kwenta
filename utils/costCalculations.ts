import Wei, { wei } from '@synthetixio/wei';

import { FuturesOrderType } from 'queries/futures/types';
import { FuturesMarket } from 'sdk/types/futures';

import { zeroBN } from './formatters/number';

export const computeDelayedOrderFee = (
	market: FuturesMarket | undefined,
	sizeDelta: Wei,
	isOffchain: boolean
) => {
	if (
		!market?.marketSkew ||
		!market?.price ||
		!market?.feeRates.takerFeeDelayedOrder ||
		!market?.feeRates.makerFeeDelayedOrder ||
		!market?.feeRates.takerFeeOffchainDelayedOrder ||
		!market?.feeRates.makerFeeOffchainDelayedOrder ||
		!sizeDelta
	) {
		return { commitDeposit: undefined, delayedOrderFee: undefined };
	}

	const notionalDiff = sizeDelta.mul(market.price);

	const makerFee = isOffchain
		? market.feeRates.makerFeeOffchainDelayedOrder
		: market.feeRates.makerFeeDelayedOrder;
	const takerFee = isOffchain
		? market.feeRates.takerFeeOffchainDelayedOrder
		: market.feeRates.takerFeeDelayedOrder;
	const staticRate = sameSide(notionalDiff, market.marketSkew) ? takerFee : makerFee;
	return {
		commitDeposit: notionalDiff.mul(staticRate).abs(),
		delayedOrderFee: notionalDiff.mul(staticRate).abs(),
	};
};

export const computeOrderFee = (
	market: FuturesMarket | undefined,
	sizeDelta: Wei,
	orderType: FuturesOrderType
) => {
	if (
		!market?.marketSkew ||
		!market?.price ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!market?.feeRates.takerFeeDelayedOrder ||
		!market?.feeRates.makerFeeDelayedOrder ||
		!market?.feeRates.takerFeeOffchainDelayedOrder ||
		!market?.feeRates.makerFeeOffchainDelayedOrder ||
		!sizeDelta
	) {
		return {
			orderFee: zeroBN,
			makerFee: zeroBN,
			takerFee: zeroBN,
		};
	}

	const makerFee =
		orderType === 'delayed offchain'
			? market.feeRates.makerFeeOffchainDelayedOrder
			: orderType === 'delayed'
			? market.feeRates.makerFeeDelayedOrder
			: market.feeRates.makerFee;
	const takerFee =
		orderType === 'delayed offchain'
			? market.feeRates.takerFeeOffchainDelayedOrder
			: orderType === 'delayed'
			? market.feeRates.takerFeeDelayedOrder
			: market.feeRates.takerFee;

	const notionalDiff = sizeDelta.mul(market.price);
	return {
		orderFee: sameSide(notionalDiff, market.marketSkew) ? takerFee : makerFee,
		makerFee,
		takerFee,
	};
};

export const computeMarketFee = (market: FuturesMarket | undefined, sizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
		!market?.price ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!sizeDelta
	) {
		return zeroBN;
	}

	const notionalDiff = sizeDelta.mul(market.price);

	if (sameSide(notionalDiff, market.marketSkew)) {
		return market.feeRates.takerFee;
	} else {
		return market.feeRates.makerFee;
	}
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
