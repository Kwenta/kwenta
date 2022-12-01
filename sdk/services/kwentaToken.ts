import { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Contract as EthCallContract } from 'ethcall';
import { ethers } from 'ethers';
import moment from 'moment';
import KwentaSDK from 'sdk';

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from 'queries/files/constants';
import { ContractName } from 'sdk/contracts';
import { formatTruncatedDuration } from 'utils/formatters/date';

import * as sdkErrors from '../common/errors';
import ERC20ABI from '../contracts/abis/ERC20.json';
import KwentaArrakisVaultABI from '../contracts/abis/KwentaArrakisVault.json';
import MultipleMerkleDistributorABI from '../contracts/abis/MultipleMerkleDistributor.json';
import RewardEscrowABI from '../contracts/abis/RewardEscrow.json';
import StakingRewardsABI from '../contracts/abis/StakingRewards.json';
import SupplyScheduleABI from '../contracts/abis/SupplySchedule.json';

const client = axios.create({
	baseURL: `${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`,
	timeout: 5000,
});

export type ClaimParams = [number, string, string, string[], number];

type EpochData = {
	merkleRoot: string;
	tokenTotal: string;
	claims: {
		[address: string]: {
			index: number;
			amount: string;
			proof: string[];
		};
	};
};

export type EscrowData = {
	id: number;
	date: string;
	time: string;
	vestable: number;
	amount: number;
	fee: number;
	status: 'VESTING' | 'VESTED';
};

export default class KwentaTokenService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public changePoolTokens(amount: string, action: 'stake' | 'withdraw') {
		if (!this.sdk.context.contracts.StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.StakingRewards,
			action,
			[wei(amount).toBN()]
		);
	}

	public approveLPToken() {
		return this.approveToken('KwentaArrakisVault', 'StakingRewards');
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

	public claimRewards() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards;

		if (!StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(StakingRewards, 'getReward', []);
	}

	public async getStakingData() {
		const {
			RewardEscrow,
			KwentaToken,
			SupplySchedule,
			vKwentaToken,
			MultipleMerkleDistributor,
			veKwentaToken,
			KwentaStakingRewards,
			vKwentaRedeemer,
			veKwentaRedeemer,
		} = this.sdk.context.contracts;

		if (
			!RewardEscrow ||
			!KwentaStakingRewards ||
			!KwentaToken ||
			!SupplySchedule ||
			!vKwentaToken ||
			!MultipleMerkleDistributor ||
			!veKwentaToken ||
			!vKwentaRedeemer ||
			!veKwentaRedeemer
		) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const RewardEscrowContract = new EthCallContract(RewardEscrow.address, RewardEscrowABI);
		const KwentaStakingRewardsContract = new EthCallContract(
			KwentaStakingRewards.address,
			StakingRewardsABI
		);
		const KwentaTokenContract = new EthCallContract(KwentaToken.address, ERC20ABI);
		const SupplyScheduleContract = new EthCallContract(SupplySchedule.address, SupplyScheduleABI);
		const vKwentaTokenContract = new EthCallContract(vKwentaToken.address, ERC20ABI);
		const MultipleMerkleDistributorContract = new EthCallContract(
			MultipleMerkleDistributor.address,
			MultipleMerkleDistributorABI
		);
		const veKwentaTokenContract = new EthCallContract(veKwentaToken.address, ERC20ABI);

		const [
			rewardEscrowBalance,
			stakedNonEscrowedBalance,
			stakedEscrowedBalance,
			claimableBalance,
			kwentaBalance,
			weekCounter,
			totalStakedBalance,
			vKwentaBalance,
			vKwentaAllowance,
			kwentaAllowance,
			epochPeriod,
			veKwentaBalance,
			veKwentaAllowance,
		]: ethers.BigNumber[] = await this.sdk.context.multicallProvider.all([
			RewardEscrowContract.balanceOf(this.sdk.context.walletAddress),
			KwentaStakingRewardsContract.nonEscrowedBalanceOf(this.sdk.context.walletAddress),
			KwentaStakingRewardsContract.escrowedBalanceOf(this.sdk.context.walletAddress),
			KwentaStakingRewardsContract.earned(this.sdk.context.walletAddress),
			KwentaTokenContract.balanceOf(this.sdk.context.walletAddress),
			SupplyScheduleContract.weekCounter(),
			KwentaStakingRewardsContract.totalSupply(),
			vKwentaTokenContract.balanceOf(this.sdk.context.walletAddress),
			vKwentaTokenContract.allowance(this.sdk.context.walletAddress, vKwentaRedeemer.address),
			KwentaTokenContract.allowance(this.sdk.context.walletAddress, KwentaStakingRewards.address),
			MultipleMerkleDistributorContract.distributionEpoch(),
			veKwentaTokenContract.balanceOf(this.sdk.context.walletAddress),
			veKwentaTokenContract.allowance(this.sdk.context.walletAddress, veKwentaRedeemer.address),
		]);

		return {
			rewardEscrowBalance: wei(rewardEscrowBalance),
			stakedNonEscrowedBalance: wei(stakedNonEscrowedBalance),
			stakedEscrowedBalance: wei(stakedEscrowedBalance),
			claimableBalance: wei(claimableBalance),
			kwentaBalance: wei(kwentaBalance),
			weekCounter: Number(weekCounter),
			totalStakedBalance: wei(totalStakedBalance),
			vKwentaBalance: wei(vKwentaBalance),
			vKwentaAllowance: wei(vKwentaAllowance),
			kwentaAllowance: wei(kwentaAllowance),
			epochPeriod: Number(epochPeriod),
			veKwentaBalance: wei(veKwentaBalance),
			veKwentaAllowance: wei(veKwentaAllowance),
		};
	}

	public async getEscrowData() {
		const { RewardEscrow } = this.sdk.context.contracts;

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const RewardEscrowContract = new EthCallContract(RewardEscrow.address, RewardEscrowABI);

		const schedules = await RewardEscrow.getVestingSchedules(
			this.sdk.context.walletAddress,
			0,
			1000
		);

		const vestingSchedules = schedules.filter((schedule) => schedule.escrowAmount.gt(0));

		const calls = vestingSchedules.map((schedule) =>
			RewardEscrowContract.getVestingEntryClaimable(
				this.sdk.context.walletAddress,
				schedule.entryID
			)
		);

		const vestingEntries: {
			quantity: ethers.BigNumber;
			fee: ethers.BigNumber;
		}[] = await this.sdk.context.multicallProvider.all(calls);

		const { escrowData, totalVestable } = vestingSchedules.reduce(
			(acc, next, i) => {
				const vestable = Number(ethers.utils.formatEther(vestingEntries[i].quantity));
				const date = Number(next.endTime) * 1000;

				acc.totalVestable += vestable;

				acc.escrowData.push({
					id: Number(next.entryID),
					date: moment(date).format('MM/DD/YY'),
					time: formatTruncatedDuration(Number(next.endTime) - new Date().getTime() / 1000),
					vestable,
					amount: Number(ethers.utils.formatEther(next.escrowAmount)),
					fee: Number(ethers.utils.formatEther(vestingEntries[i].fee)),
					status: date > Date.now() ? 'VESTING' : 'VESTED',
				});

				return acc;
			},
			{ escrowData: [] as EscrowData[], totalVestable: 0 }
		);

		return { escrowData, totalVestable };
	}

	public getReward() {
		const { KwentaStakingRewards } = this.sdk.context.contracts;

		if (!KwentaStakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(KwentaStakingRewards, 'getReward', []);
	}

	// TODO: Delete `approveLPToken` method.
	// In that case, we can safely remove the map object from this method.

	public approveKwentaToken(token: 'kwenta' | 'vKwenta' | 'veKwenta') {
		const {
			KwentaToken,
			KwentaStakingRewards,
			vKwentaToken,
			vKwentaRedeemer,
			veKwentaToken,
			veKwentaRedeemer,
		} = this.sdk.context.contracts;

		const map = {
			kwenta: { contract: KwentaToken, spender: KwentaStakingRewards },
			vKwenta: { contract: vKwentaToken, spender: vKwentaRedeemer },
			veKwenta: { contract: veKwentaToken, spender: veKwentaRedeemer },
		};

		const { contract, spender } = map[token];

		if (!contract || !spender) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(contract, 'approve', [
			spender.address,
			ethers.constants.MaxUint256,
		]);
	}

	public approveToken(token: ContractName, spender?: ContractName) {
		const tokenContract = this.sdk.context.contracts[token];

		if (!tokenContract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		let spenderAddress = this.sdk.context.walletAddress;

		if (spender) {
			const spenderContract = this.sdk.context.contracts[spender];
			if (spenderContract) spenderAddress = spenderContract.address;
		}

		return this.sdk.transactions.createContractTxn(tokenContract, 'approve', [
			spenderAddress,
			ethers.constants.MaxUint256,
		]);
	}

	public redeemToken(token: ContractName) {
		const tokenContract = this.sdk.context.contracts[token];

		if (!tokenContract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(tokenContract, 'redeem', [
			this.sdk.context.walletAddress,
		]);
	}

	public redeemVKwenta() {
		return this.redeemToken('vKwentaRedeemer');
	}

	public redeemVeKwenta() {
		return this.redeemToken('veKwentaRedeemer');
	}

	public vestToken(ids: number[]) {
		const { RewardEscrow } = this.sdk.context.contracts;

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(RewardEscrow, 'vest', [ids]);
	}

	public stakeKwenta(amount: string) {
		return this.performStakeAction('stake', amount);
	}

	public async unstakeKwenta(amount: string) {
		return this.performStakeAction('unstake', amount);
	}

	public async stakeEscrowedKwenta(amount: string) {
		return this.performStakeAction('stake', amount, { escrow: true });
	}

	public async unstakeEscrowedKwenta(amount: string) {
		return this.performStakeAction('unstake', amount, { escrow: true });
	}

	public async getClaimableRewards(periods: number[]) {
		const { MultipleMerkleDistributor } = this.sdk.context.contracts;

		if (!MultipleMerkleDistributor) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const MultipleMerkleDistributorContract = new EthCallContract(
			MultipleMerkleDistributor.address,
			MultipleMerkleDistributorABI
		);

		const fileNames = periods
			.slice(0, -1)
			.map(
				(i) =>
					`trading-rewards-snapshots/${
						this.sdk.context.networkId === 420 ? `goerli-` : ''
					}epoch-${i}.json`
			);

		const responses: EpochData[] = [];

		for (const fileName of fileNames) {
			const response = await client.get(fileName);
			responses.push(response.data ?? null);
		}

		const rewards = responses
			.map((d, period) => {
				const { walletAddress } = this.sdk.context;
				const walletReward = d.claims[walletAddress];
				return [walletReward.index, walletAddress, walletReward.amount, walletReward.proof, period];
			})
			.filter((x): x is ClaimParams => !!x);

		const claimed: boolean[] = await this.sdk.context.multicallProvider.all(
			rewards.map((reward) => MultipleMerkleDistributorContract.isClaimed(reward[0], reward[4]))
		);

		const { totalRewards, claimableRewards } = rewards.reduce(
			(acc, next, i) => {
				if (!claimed[i]) {
					acc.claimableRewards.push(next);
					acc.totalRewards += Number(next[2]) / 1e18;
				}

				return acc;
			},
			{ claimableRewards: [] as ClaimParams[], totalRewards: 0 }
		);

		return { claimableRewards, totalRewards };
	}

	public async claimMultipleRewards(claimableRewards: ClaimParams[]) {
		const { MultipleMerkleDistributor } = this.sdk.context.contracts;

		if (!MultipleMerkleDistributor) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(MultipleMerkleDistributor, 'claimMultiple', [
			claimableRewards,
		]);
	}

	private async performStakeAction(
		action: 'stake' | 'unstake',
		amount: string,
		options: { escrow: boolean } = { escrow: false }
	) {
		const { RewardEscrow, KwentaStakingRewards } = this.sdk.context.contracts;

		if (!RewardEscrow || !KwentaStakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const contract = options?.escrow ? RewardEscrow : KwentaStakingRewards;

		return this.sdk.transactions.createContractTxn(
			contract,
			`${action}${options?.escrow ? 'Escrow' : ''}`,
			[amount]
		);
	}
}
