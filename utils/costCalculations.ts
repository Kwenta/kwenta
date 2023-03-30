import Wei, { wei } from '@synthetixio/wei';

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
		return {
			commitDeposit: zeroBN,
			delayedOrderFee: zeroBN,
			makerFeeRate: zeroBN,
			takerFeeRate: zeroBN,
		};
	}

	const makerFeeRate = isOffchain
		? market.feeRates.makerFeeOffchainDelayedOrder
		: market.feeRates.makerFeeDelayedOrder;
	const takerFeeRate = isOffchain
		? market.feeRates.takerFeeOffchainDelayedOrder
		: market.feeRates.takerFeeDelayedOrder;
	const staticRate = sameSide(susdSizeDelta, market.marketSkew) ? takerFeeRate : makerFeeRate;
	return {
		commitDeposit: susdSizeDelta.mul(staticRate).abs(),
		delayedOrderFee: susdSizeDelta.mul(staticRate).abs(),
		makerFeeRate,
		takerFeeRate,
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
	return a.gt(wei(0)) === b.gt(wei(0));
};
