import Wei from '@synthetixio/wei';

export type ChartPosition = {
	size: Wei;
	price: Wei;
	liqPrice: Wei | undefined;
};
