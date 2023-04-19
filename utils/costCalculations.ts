import Wei, { wei } from '@synthetixio/wei';

import { FuturesMarket } from 'sdk/types/futures';

import { zeroBN } from './formatters/number';

export const computeDelayedOrderFee = (market: FuturesMarket | undefined, susdSizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
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

	const makerFeeRate = market.feeRates.makerFeeOffchainDelayedOrder;
	const takerFeeRate = market.feeRates.takerFeeOffchainDelayedOrder;
	const staticRate = sameSide(susdSizeDelta, market.marketSkew) ? takerFeeRate : makerFeeRate;

	return {
		commitDeposit: susdSizeDelta.mul(staticRate).abs(),
		delayedOrderFee: susdSizeDelta.mul(staticRate).abs(),
		makerFeeRate,
		takerFeeRate,
	};
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
