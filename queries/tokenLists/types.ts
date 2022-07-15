import { NetworkId } from '@synthetixio/contracts-interface';

export type Token = {
	address: string;
	decimals: number;
	logoURI: string;
	name: string;
	symbol: string;
	chainId: NetworkId;
	tags: string[];
};

export type ZapperTokenListResponse = {
	tokens: Token[];
};

export type OneInchTokenListResponse = {
	tokens: Record<string, Token>;
};

export type TokenListQueryResponse = {
	tokens: Token[];
	tokensMap: Record<string, Token>;
	symbols: string[];
};
