export type Token = {
	address: string;
	chainId: number;
	decimals: number;
	logoURI: string;
	name: string;
	symbol: string;
	tags: string[];
};

export type TokenListResponse = {
	keywords: string[];
	logoURI: string;
	name: string;
	tags: any;
	timestamp: string;
	tokens: Token[];
	version: { major: number; minor: number; patch: number };
};

export type TokenListQueryResponse = {
	tokens: Token[];
	tokensMap: Record<string, Token>;
	symbols: string[];
};
