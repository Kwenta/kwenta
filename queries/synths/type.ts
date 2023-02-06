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
	fromAmount: string;
	fromAmountInUSD: string;
	toAmount: string;
	toAmountInUSD: string;
	feesInUSD: string;
	toAddress: string;
	timestamp: string;
	gasPrice: string;
};
