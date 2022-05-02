import Wei, { wei } from '@synthetixio/wei';
import { NextPriceDetails } from 'queries/futures/useGetNextPriceDetails';

export const computeNPFee = (details: NextPriceDetails | null | undefined, sizeDelta: Wei) => {
	if (
		!details?.marketSkew ||
		!details?.assetPrice ||
		!details?.takerFee ||
		!details?.makerFee ||
		!sizeDelta
	) {
		return undefined;
	}

	const notionalDiff = sizeDelta.mul(details.assetPrice);
	const staticRate = sameSide(notionalDiff, details.marketSkew)
		? details.takerFee
		: details.makerFee;

	return notionalDiff.mul(staticRate).abs();
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
