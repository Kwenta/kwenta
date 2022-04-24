import Wei from '@synthetixio/wei';

export type ChartPosition = {
	size: Wei;
	avgEntryPrice: Wei;
	liquidationPrice: Wei | undefined;
};
