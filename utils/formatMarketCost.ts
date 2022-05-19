import Wei, { wei } from '@synthetixio/wei';
export type MarketCostDetails = {
	marketSkew: Wei;
	takerFee: Wei;
	makerFee: Wei;
	assetPrice: Wei;
};

export const formatMarketCosts = (
	details: MarketCostDetails | null | undefined,
	sizeDelta: Wei
) => {
	if (
		!details?.marketSkew ||
		!details?.assetPrice ||
		!details?.takerFee ||
		!details?.makerFee ||
		!sizeDelta
	) {
		return {
			baseFee: undefined,
			baseFeePercentile: undefined,
		};
	}

	const notionalDiff = sizeDelta.mul(details.assetPrice);

	let staticRate: Wei;

	if (sameSide(notionalDiff, details.marketSkew)) {
		staticRate = details.takerFee;
	} else {
		staticRate = details.makerFee;
	}

	return {
		baseFee: notionalDiff.mul(staticRate).abs(),
		baseFeePercentile: staticRate,
	};
};

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0));
};
