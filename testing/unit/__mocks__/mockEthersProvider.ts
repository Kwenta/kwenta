import { BigNumber } from '@ethersproject/bignumber';

import { DEFAULT_NETWORK } from 'testing/unit/constants';
import { weiFromEth } from 'utils/formatters/number';

export type MockEthProvider = Record<string, any>;

const DEFAULT_PROVIDER = {
	network: DEFAULT_NETWORK,
	blockNumber: 5000,
	getNetwork: () => DEFAULT_NETWORK,
	waitForTransaction: () => {},
	getBlockNumber: () => 5000,
	getGasPrice: () => BigNumber.from('2000000000'),
	getBalance: () => BigNumber.from(weiFromEth('10')),
	estimateGas: () => BigNumber.from('100000'),
	sendTransaction: () => {},
	getLogs: () => [],
	getEtherPrice: () => 1000,
	getTransactionCount: () => 1,
	getAvatar: () => '',
	lookupAddress: () => 'name',
};

export const mockProvider = (overrides: MockEthProvider = {}) => {
	return {
		...DEFAULT_PROVIDER,
		...overrides,
	};
};
