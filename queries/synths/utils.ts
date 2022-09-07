import { NetworkId } from '@synthetixio/contracts-interface';
import { Contract } from 'ethcall';

import {
	SYNTHS_ENDPOINT_MAIN,
	SYNTHS_ENDPOINT_OPTIMISM_KOVAN,
	SYNTHS_ENDPOINT_OPTIMISM_MAIN,
} from './constants';

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

export const getSynthsEndpoint = (networkId: NetworkId): string => {
	return networkId === 10
		? SYNTHS_ENDPOINT_OPTIMISM_MAIN
		: networkId === 69
		? SYNTHS_ENDPOINT_OPTIMISM_KOVAN
		: SYNTHS_ENDPOINT_MAIN;
};

export function notNill<Value>(value: Value | null | undefined): value is Value {
	return value !== null && value !== undefined;
}
