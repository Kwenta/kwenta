import { FetchStatus } from 'state/types';

export type EarnState = {
	amount: string;
	balance?: string;
	earnedRewards: string;
	endDate: number;
	error?: string;
	stakeStatus: FetchStatus;
	unstakeStatus: FetchStatus;
};
