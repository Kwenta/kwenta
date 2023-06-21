type Token = {
	symbol: string;
	name: string;
	address: string;
	decimals: number;
	logoURI: string;
};

export type OneInchQuoteResponse = {
	fromToken: Token;
	toToken: Token;
	toTokenAmount: string;
	fromTokenAmount: string;
};

export type OneInchSwapResponse = OneInchQuoteResponse & {
	tx: {
		from: string;
		to: string;
		data: string;
		value: string;
		gasPrice: string;
		gas: number;
	};
};

export type OneInchApproveSpenderResponse = {
	address: string;
};

export type OneInchTokenListResponse = {
	tokens: Record<string, Token>;
};
