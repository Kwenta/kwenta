import KwentaSDK from 'sdk';

import { ClaimParams } from 'sdk/services/kwentaToken';

export type EscrowData = Awaited<
	ReturnType<KwentaSDK['kwentaToken']['getEscrowData']>
>['escrowData'];

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
	totalVestable: number;
	escrowData: EscrowData;
	totalRewards: number;
	claimableRewards: ClaimParams[];
	selectedEpoch?: number;
};
