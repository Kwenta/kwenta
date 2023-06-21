import Wei from '@synthetixio/wei';

import { NetworkId } from '../types/common';

export type TokenBalances<T = Wei> = Record<
	string,
	{
		balance: T;
		token: Token;
	}
>;

export type Token = {
	address: string;
	chainId: NetworkId;
	decimals: number;
	logoURI: string;
	name: string;
	symbol: string;
	tags: string[];
};
