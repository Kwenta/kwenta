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
