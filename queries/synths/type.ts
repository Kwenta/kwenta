import Wei from '@synthetixio/wei';

type SynthResult = {
	id: string;
	name: string;
	symbol: string;
	totalSupply: Wei;
};

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
