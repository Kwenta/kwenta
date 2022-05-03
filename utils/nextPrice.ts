import Wei, { wei } from '@synthetixio/wei';
import { NextPriceDetails } from 'queries/futures/useGetNextPriceDetails';

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
	const staticRate = sameSide(notionalDiff, details.marketSkew)
		? details.takerFee
		: details.makerFee;

	const staticRateNP = sameSide(notionalDiff, details.marketSkew)
		? details.takerFeeNextPrice
		: details.makerFeeNextPrice;

	return {
		commitDeposit: notionalDiff.mul(staticRate).abs(),
		nextPriceFee: notionalDiff.mul(staticRateNP).abs(),
	};
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
