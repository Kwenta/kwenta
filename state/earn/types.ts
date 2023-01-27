import { FetchStatus } from 'state/types';

export type EarnState = {
	balance: string;
	earnedRewards: string;
	rewardRate: string;
	totalSupply: string;
	lpTokenBalance: string;
	allowance: string;
	endDate: number;
	error?: string;
	stakeStatus: FetchStatus;
	unstakeStatus: FetchStatus;
	amount0: string;
	amount1: string;
	lpTotalSupply: string;
};
