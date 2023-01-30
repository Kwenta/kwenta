import Wei from '@synthetixio/wei';

import { FuturesOrderType } from 'queries/futures/types';
import { FuturesMarket } from 'sdk/types/futures';

import { zeroBN } from './formatters/number';

export const computeDelayedOrderFee = (
	market: FuturesMarket | undefined,
	susdSizeDelta: Wei,
	isOffchain: boolean
) => {
	if (
		!market?.marketSkew ||
		!market?.feeRates.takerFeeDelayedOrder ||
		!market?.feeRates.makerFeeDelayedOrder ||
		!market?.feeRates.takerFeeOffchainDelayedOrder ||
		!market?.feeRates.makerFeeOffchainDelayedOrder ||
		!susdSizeDelta
	) {
		return { commitDeposit: undefined, delayedOrderFee: undefined };
	}

	const makerFee = isOffchain
		? market.feeRates.makerFeeOffchainDelayedOrder
		: market.feeRates.makerFeeDelayedOrder;
	const takerFee = isOffchain
		? market.feeRates.takerFeeOffchainDelayedOrder
		: market.feeRates.takerFeeDelayedOrder;
	const staticRate = sameSide(susdSizeDelta, market.marketSkew) ? takerFee : makerFee;
	return {
		commitDeposit: susdSizeDelta.mul(staticRate).abs(),
		delayedOrderFee: susdSizeDelta.mul(staticRate).abs(),
	};
};

export const computeOrderFee = (
	market: FuturesMarket | undefined,
	susdSizeDelta: Wei,
	orderType: FuturesOrderType
) => {
	if (
		!market?.marketSkew ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!market?.feeRates.takerFeeDelayedOrder ||
		!market?.feeRates.makerFeeDelayedOrder ||
		!market?.feeRates.takerFeeOffchainDelayedOrder ||
		!market?.feeRates.makerFeeOffchainDelayedOrder ||
		!susdSizeDelta
	) {
		return {
			orderFee: zeroBN,
			makerFee: zeroBN,
			takerFee: zeroBN,
		};
	}

	const makerFee =
		orderType === 'delayedOffchain'
			? market.feeRates.makerFeeOffchainDelayedOrder
			: orderType === 'delayed'
			? market.feeRates.makerFeeDelayedOrder
			: market.feeRates.makerFee;
	const takerFee =
		orderType === 'delayedOffchain'
			? market.feeRates.takerFeeOffchainDelayedOrder
			: orderType === 'delayed'
			? market.feeRates.takerFeeDelayedOrder
			: market.feeRates.takerFee;

	return {
		orderFee: sameSide(susdSizeDelta, market.marketSkew) ? takerFee : makerFee,
		makerFee,
		takerFee,
	};
};

export const computeMarketFee = (market: FuturesMarket | undefined, usdSizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!usdSizeDelta
	) {
		return zeroBN;
	}

	if (sameSide(usdSizeDelta, market.marketSkew)) {
		return market.feeRates.takerFee;
	} else {
		return market.feeRates.makerFee;
	}
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(0) === b.gt(0);
};
