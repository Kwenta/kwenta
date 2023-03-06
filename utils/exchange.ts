import Wei from '@synthetixio/wei';

export type SynthResult = {
	id: string;
	name: string;
	symbol: string;
	totalSupply: Wei;
};

export type WalletTradesExchangeResult = {
	id: string;
	fromSynth: Partial<SynthResult> | null;
	toSynth: Partial<SynthResult> | null;
	fromAmount: Wei;
	fromAmountInUSD: Wei;
	toAmount: Wei;
	toAmountInUSD: Wei;
	feesInUSD: Wei;
	toAddress: string;
	timestamp: number;
	gasPrice: Wei;
	hash: string;
};
