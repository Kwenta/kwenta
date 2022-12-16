import Wei, { wei } from '@synthetixio/wei';

import { FuturesMarket } from 'sdk/types/futures';

import { zeroBN } from './formatters/number';

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
