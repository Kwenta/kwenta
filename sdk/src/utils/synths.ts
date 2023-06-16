import { Contract } from 'ethcall';
import { BigNumber } from '@ethersproject/bignumber';

import ERC20ABI from '../src/contracts/abis/ERC20.json';

export const getProxySynthSymbol = (address: string) => {
	const c = new Contract(address, ERC20ABI);
	return c.symbol();
};

export const getReasonFromCode = (reasonCode: BigNumber | number) => {
	switch (Number(reasonCode)) {
		case 1:
			return 'system-upgrade';
		case 2:
			return 'market-closure';
		case 3:
		case 55:
		case 65:
			return 'circuit-breaker';
		case 99999:
			return 'emergency';
		default:
			return 'market-closure';
	}
};

export type MarketClosureReason = ReturnType<typeof getReasonFromCode>;
