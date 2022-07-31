import Wei, { wei } from '@synthetixio/wei';

import { FuturesMarket } from 'queries/futures/types';

import { zeroBN } from './formatters/number';

export const computeNPFee = (market: FuturesMarket | undefined, sizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
		!market?.price ||
		!market?.feeRates.takerFee ||
		!market?.feeRates.makerFee ||
		!market?.feeRates.takerFeeNextPrice ||
		!market?.feeRates.makerFeeNextPrice ||
		!sizeDelta
	) {
		return { commitDeposit: undefined, nextPriceFee: undefined };
	}

	const notionalDiff = sizeDelta.mul(market.price);

	let staticRate: Wei;
	let staticRateNP: Wei;

	if (sameSide(notionalDiff, market.marketSkew)) {
		staticRate = market.feeRates.takerFee;
		staticRateNP = market.feeRates.takerFeeNextPrice;
	} else {
		staticRate = market.feeRates.makerFee;
		staticRateNP = market.feeRates.makerFeeNextPrice;
	}

	return {
		commitDeposit: notionalDiff.mul(staticRate).abs(),
		nextPriceFee: notionalDiff.mul(staticRateNP).abs(),
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
