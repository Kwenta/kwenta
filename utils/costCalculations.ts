import Wei, { wei } from '@synthetixio/wei';

import { FuturesMarket } from 'sdk/types/futures';

import { zeroBN } from './formatters/number';

export const computeNPFee = (market: FuturesMarket | undefined, sizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
		!market?.price ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!sizeDelta
	) {
		return { commitDeposit: undefined };
	}

	const notionalDiff = sizeDelta.mul(market.price);

	let staticRate: Wei;

	if (sameSide(notionalDiff, market.marketSkew)) {
		staticRate = market.feeRates.takerFee;
	} else {
		staticRate = market.feeRates.makerFee;
	}

	return {
		commitDeposit: notionalDiff.mul(staticRate).abs(),
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
