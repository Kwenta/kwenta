import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import KwentaSDK from '..';
import { ContractName } from '../contracts';
import { BigNumber } from '@ethersproject/bignumber';
export type ClaimParams = [number, string, string, string[], number];
export type EscrowData<T = Wei> = {
    id: number;
    date: string;
    time: string;
    vestable: T;
    amount: T;
    fee: T;
    status: 'VESTING' | 'VESTED';
};
export default class KwentaTokenService {
    private sdk;
    constructor(sdk: KwentaSDK);
    changePoolTokens(amount: string, action: 'stake' | 'withdraw'): Promise<ethers.providers.TransactionResponse>;
    approveLPToken(): Promise<ethers.providers.TransactionResponse>;
    getEarnDetails(): Promise<{
        balance: Wei;
        earned: Wei;
        endDate: any;
        rewardRate: Wei;
        totalSupply: Wei;
        lpTokenBalance: Wei;
        allowance: Wei;
        wethAmount: Wei;
        kwentaAmount: Wei;
        lpTotalSupply: Wei;
    }>;
    getEarnTokenPrices(): Promise<{
        kwentaPrice: Wei;
        wethPrice: Wei;
        opPrice: Wei;
    }>;
    claimRewards(): Promise<ethers.providers.TransactionResponse>;
    getStakingData(): Promise<{
        rewardEscrowBalance: Wei;
        stakedNonEscrowedBalance: Wei;
        stakedEscrowedBalance: Wei;
        claimableBalance: Wei;
        kwentaBalance: Wei;
        weekCounter: number;
        totalStakedBalance: Wei;
        vKwentaBalance: Wei;
        vKwentaAllowance: Wei;
        kwentaAllowance: Wei;
        epochPeriod: number;
        veKwentaBalance: Wei;
        veKwentaAllowance: Wei;
    }>;
    getEscrowData(): Promise<{
        escrowData: EscrowData<Wei>[];
        totalVestable: Wei;
    }>;
    getReward(): Promise<ethers.providers.TransactionResponse>;
    approveKwentaToken(token: 'kwenta' | 'vKwenta' | 'veKwenta', amount?: ethers.BigNumber): Promise<ethers.providers.TransactionResponse>;
    approveToken(token: ContractName, spender?: ContractName, amount?: ethers.BigNumber): Promise<ethers.providers.TransactionResponse>;
    redeemToken(token: ContractName, options?: {
        hasAddress: boolean;
    }): Promise<ethers.providers.TransactionResponse>;
    redeemVKwenta(): Promise<ethers.providers.TransactionResponse>;
    redeemVeKwenta(): Promise<ethers.providers.TransactionResponse>;
    vestToken(ids: number[]): Promise<ethers.providers.TransactionResponse>;
    stakeKwenta(amount: string | BigNumber): Promise<ethers.providers.TransactionResponse>;
    unstakeKwenta(amount: string | BigNumber): Promise<ethers.providers.TransactionResponse>;
    stakeEscrowedKwenta(amount: string | BigNumber): Promise<ethers.providers.TransactionResponse>;
    unstakeEscrowedKwenta(amount: string | BigNumber): Promise<ethers.providers.TransactionResponse>;
    getClaimableRewards(epochPeriod: number, isOldDistributor?: boolean): Promise<{
        claimableRewards: ClaimParams[];
        totalRewards: Wei;
    }>;
    getClaimableAllRewards(epochPeriod: number, isOldDistributor?: boolean, isOp?: boolean, isSnx?: boolean): Promise<{
        claimableRewards: ClaimParams[];
        totalRewards: Wei;
    }>;
    claimMultipleKwentaRewards(claimableRewards: ClaimParams[][]): Promise<ethers.providers.TransactionResponse>;
    claimMultipleAllRewards(claimableRewards: ClaimParams[][]): Promise<ethers.providers.TransactionResponse>;
    claimOpRewards(claimableRewards: ClaimParams[], isSnx?: boolean): Promise<ethers.providers.TransactionResponse>;
    getFuturesFee(start: number, end: number): Promise<Pick<import("../utils/subgraph").FuturesAggregateStatResult, "timestamp" | "feesKwenta">[]>;
    getFuturesFeeForAccount(account: string, start: number, end: number): Promise<Pick<import("../utils/subgraph").FuturesTradeResult, "account" | "timestamp" | "abstractAccount" | "accountType" | "feesPaid" | "keeperFeesPaid">[] | null>;
    private performStakeAction;
}
