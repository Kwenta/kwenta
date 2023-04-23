import type { EscrowData } from 'sdk/services/kwentaToken';
import { ClaimParams } from 'sdk/services/kwentaToken';
import { FetchStatus } from 'state/types';

export type StakingState = {
	kwentaBalance: string;
	vKwentaBalance: string;
	veKwentaBalance: string;
	escrowedKwentaBalance: string;
	claimableBalance: string;
	totalStakedBalance: string;
	stakedEscrowedKwentaBalance: string;
	stakedKwentaBalance: string;
	epochPeriod: number;
	weekCounter: number;
	kwentaAllowance: string;
	vKwentaAllowance: string;
	veKwentaAllowance: string;
	totalVestable: string;
	escrowData: EscrowData<string>[];
	totalRewards: string;
	totalRewardsAll: string;
	kwentaOpRewards: string;
	snxOpRewards: string;
	claimableRewards: ClaimParams[][];
	claimableRewardsAll: ClaimParams[][];
	claimableRewardsOp: ClaimParams[];
	claimableRewardsSnxOp: ClaimParams[];
	selectedEpoch?: number;
	stakeStatus: FetchStatus;
	unstakeStatus: FetchStatus;
	stakeEscrowedStatus: FetchStatus;
	unstakeEscrowedStatus: FetchStatus;
	getRewardStatus: FetchStatus;
	claimRewardsStatus: FetchStatus;
	vestEscrowedRewardsStatus: FetchStatus;
};
