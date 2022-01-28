import { Contract } from 'ethcall';

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
