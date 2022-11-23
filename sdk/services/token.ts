import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import KwentaSDK from 'sdk';

import * as sdkErrors from '../common/errors';

export default class TokenService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async changePoolTokens(amount: string, action: 'stake' | 'withdraw') {
		if (!this.sdk.context.contracts.StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.StakingRewards,
			action,
			[wei(amount).toBN()]
		);

		return hash;
	}

	public async approveLPToken() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards;
		const KwentaArrakisVault = this.sdk.context.contracts.KwentaArrakisVault;

		if (!StakingRewards || !KwentaArrakisVault) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(KwentaArrakisVault, 'approve', [
			StakingRewards.address,
			ethers.constants.MaxUint256,
		]);

		return hash;
	}

	public async getEarnDetails() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards;
		const KwentaArrakisVault = this.sdk.context.contracts.KwentaArrakisVault;

		if (!StakingRewards || !KwentaArrakisVault) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const [
			balance,
			earned,
			periodFinish,
			rewardRate,
			totalSupply,
			lpTokenBalance,
			allowance,
		] = await Promise.all([
			StakingRewards.balanceOf(this.sdk.context.walletAddress),
			StakingRewards.earned(this.sdk.context.walletAddress),
			StakingRewards.periodFinish(),
			StakingRewards.rewardRate(),
			StakingRewards.totalSupply(),
			KwentaArrakisVault.balanceOf(this.sdk.context.walletAddress),
			KwentaArrakisVault.allowance(this.sdk.context.walletAddress, StakingRewards.address),
		]);

		return {
			balance: wei(balance),
			earned: wei(earned),
			endDate: periodFinish.toNumber(),
			rewardRate: wei(rewardRate),
			totalSupply: wei(totalSupply),
			lpTokenBalance: wei(lpTokenBalance),
			allowance: wei(allowance),
		};
	}

	public async claimRewards() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards;

		if (!StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(StakingRewards, 'getReward', []);

		return hash;
	}
}
