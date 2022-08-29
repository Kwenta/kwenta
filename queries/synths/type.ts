import { SynthResult } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';

export type SynthsVolumes = {
	[asset: string]: Wei;
};

export type SynthsTrades = {
	synthExchanges: SynthsTrade[];
};

export type SynthsTrade = {
	id: string;
	fromSynth: Partial<SynthResult> | null;
	fromAmount: Wei;
	fromAmountInUSD: Wei;
	toAmount: Wei;
	toAmountInUSD: Wei;
	feesInUSD: Wei;
	toAddress: string;
	timestamp: Wei;
	gasPrice: Wei;
};
