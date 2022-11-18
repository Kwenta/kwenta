import { FetchStatus } from 'state/types';

export type EarnState = {
	amount: string;
	error?: string;
	stakeStatus: FetchStatus;
	unstakeStatus: FetchStatus;
};
