import { wei } from '@synthetixio/wei';
import { Contract as EthCallContract } from 'ethcall';
import { ethers } from 'ethers';
import KwentaSDK from 'sdk';

import * as sdkErrors from '../common/errors';
import KwentaArrakisVaultABI from '../contracts/abis/KwentaArrakisVault.json';
import StakingRewardsABI from '../contracts/abis/StakingRewards.json';

export default class KwentaTokenService {
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
		const { StakingRewards, KwentaArrakisVault } = this.sdk.context.contracts;

		if (!StakingRewards || !KwentaArrakisVault) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const StakingRewardsContract = new EthCallContract(StakingRewards.address, StakingRewardsABI);
		const KwentaArrakisVaultContract = new EthCallContract(
			KwentaArrakisVault.address,
			KwentaArrakisVaultABI
		);

		const [
			balance,
			earned,
			periodFinish,
			rewardRate,
			totalSupply,
			lpTokenBalance,
			allowance,
		]: ethers.BigNumber[] = await this.sdk.context.multicallProvider.all([
			StakingRewardsContract.balanceOf(this.sdk.context.walletAddress),
			StakingRewardsContract.earned(this.sdk.context.walletAddress),
			StakingRewardsContract.periodFinish(),
			StakingRewardsContract.rewardRate(),
			StakingRewardsContract.totalSupply(),
			KwentaArrakisVaultContract.balanceOf(this.sdk.context.walletAddress),
			KwentaArrakisVaultContract.allowance(this.sdk.context.walletAddress, StakingRewards.address),
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

	public async getStakingData() {
		const {
			RewardEscrow,
			StakingRewards,
			KwentaToken,
			SupplySchedule,
			vKwentaToken,
			MultipleMerkleDistributor,
			veKwentaToken,
		} = this.sdk.context.contracts;

		if (
			!RewardEscrow ||
			!StakingRewards ||
			!KwentaToken ||
			!SupplySchedule ||
			!vKwentaToken ||
			!MultipleMerkleDistributor ||
			!veKwentaToken
		) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const RewardEscrowContract = new EthCallContract(RewardEscrow.address, []);
		const StakingRewardsContract = new EthCallContract(StakingRewards.address, []);
		const KwentaTokenContract = new EthCallContract(KwentaToken.address, []);
		const SupplyScheduleContract = new EthCallContract(SupplySchedule.address, []);
		const vKwentaTokenContract = new EthCallContract(vKwentaToken.address, []);
		const MultipleMerkleDistributorContract = new EthCallContract(
			MultipleMerkleDistributor.address,
			[]
		);
		const veKwentaTokenContract = new EthCallContract(veKwentaToken.address, []);

		const [rewardEscrowBalance]: ethers.BigNumber[] = await this.sdk.context.multicallProvider.all([
			RewardEscrowContract.balanceOf(this.sdk.context.walletAddress),
			StakingRewardsContract.nonEscrowedBalanceOf(),
			StakingRewardsContract.escrowedBalanceOf(),
			StakingRewardsContract.earned(),
			KwentaTokenContract.balanceOf(),
			SupplyScheduleContract.weekCounter(),
			StakingRewardsContract.totalSupply(),
			vKwentaTokenContract.balanceOf(),
			vKwentaTokenContract.allowance(),
			KwentaTokenContract.allowance(),
			MultipleMerkleDistributorContract.distributionEpoch(),
			veKwentaTokenContract.balanceOf(),
			veKwentaTokenContract.allowance(),
		]);

		return { rewardEscrowBalance: wei(rewardEscrowBalance) };
	}
}
