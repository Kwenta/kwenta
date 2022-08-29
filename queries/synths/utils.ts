import { Contract } from 'ethcall';

import { Network } from 'store/wallet';

import { SUBGRAPH_ENDPOINT } from './constants';

const abi = [
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
];

export const getProxySynthSymbol = (address: string) => {
	const c = new Contract(address, abi);
	return c.symbol();
};

export const getSynthsEndpoint = (network: Network): string => {
	return SUBGRAPH_ENDPOINT[network.id] || SUBGRAPH_ENDPOINT[1];
};

export function notNill<Value>(value: Value | null | undefined): value is Value {
	return value !== null && value !== undefined;
}
