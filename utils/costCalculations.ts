import Wei, { wei, WeiSource } from '@synthetixio/wei';
import { NextPriceDetails } from 'queries/futures/useGetNextPriceDetails';
import { zeroBN } from './formatters/number';

export const computeNPFee = (details: NextPriceDetails | null | undefined, sizeDelta: Wei) => {
	if (
		!details?.marketSkew ||
		!details?.assetPrice ||
		!details?.takerFee ||
		!details?.makerFee ||
		!details?.takerFeeNextPrice ||
		!details?.makerFeeNextPrice ||
		!sizeDelta
	) {
		return {
			commitDeposit: undefined,
			nextPriceFee: undefined,
		};
	}

	const notionalDiff = sizeDelta.mul(details.assetPrice);

	let staticRate: Wei;
	let staticRateNP: Wei;

	if (sameSide(notionalDiff, details.marketSkew)) {
		staticRate = details.takerFee;
		staticRateNP = details.takerFeeNextPrice;
	} else {
		staticRate = details.makerFee;
		staticRateNP = details.makerFeeNextPrice;
	}

	return {
		commitDeposit: notionalDiff.mul(staticRate).abs(),
		nextPriceFee: notionalDiff.mul(staticRateNP).abs(),
	};
};

export const computeMarketFee = (details: NextPriceDetails | null | undefined, sizeDelta: Wei) => {
	if (
		!details?.marketSkew ||
		!details?.assetPrice ||
		!details?.takerFee ||
		!details?.makerFee ||
		!sizeDelta
	) {
		return zeroBN as WeiSource;
	}

	const notionalDiff = sizeDelta.mul(details.assetPrice);

	if (sameSide(notionalDiff, details.marketSkew)) {
		return details.takerFee as WeiSource;
	} else {
		return details.makerFee as WeiSource;
	}
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
