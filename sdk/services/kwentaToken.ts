import Wei, { wei } from '@synthetixio/wei';
import axios from 'axios';
import { ethers, BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import moment from 'moment';
import KwentaSDK from 'sdk';

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults';
import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from 'queries/files/constants';
import { ContractName } from 'sdk/contracts';
import { formatTruncatedDuration } from 'utils/formatters/date';

import * as sdkErrors from '../common/errors';

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
	period: number;
};

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
		const { StakingRewards, KwentaArrakisVault } = this.sdk.context.multicallContracts;

		if (!StakingRewards || !KwentaArrakisVault) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { walletAddress } = this.sdk.context;

		const [
			balance,
			earned,
			periodFinish,
			rewardRate,
			totalSupply,
			lpTokenBalance,
			allowance,
		]: BigNumber[] = await this.sdk.context.multicallProvider.all([
			StakingRewards.balanceOf(walletAddress),
			StakingRewards.earned(walletAddress),
			StakingRewards.periodFinish(),
			StakingRewards.rewardRate(),
			StakingRewards.totalSupply(),
			KwentaArrakisVault.balanceOf(walletAddress),
			KwentaArrakisVault.allowance(walletAddress, StakingRewards.address),
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
		const { vKwentaRedeemer, veKwentaRedeemer } = this.sdk.context.contracts;

		const {
			RewardEscrow,
			KwentaStakingRewards,
			KwentaToken,
			SupplySchedule,
			vKwentaToken,
			veKwentaToken,
			MultipleMerkleDistributor,
		} = this.sdk.context.multicallContracts;

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

		const { walletAddress } = this.sdk.context;

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
		]: BigNumber[] = await this.sdk.context.multicallProvider.all([
			RewardEscrow.balanceOf(walletAddress),
			KwentaStakingRewards.nonEscrowedBalanceOf(walletAddress),
			KwentaStakingRewards.escrowedBalanceOf(walletAddress),
			KwentaStakingRewards.earned(walletAddress),
			KwentaToken.balanceOf(walletAddress),
			SupplySchedule.weekCounter(),
			KwentaStakingRewards.totalSupply(),
			vKwentaToken.balanceOf(walletAddress),
			vKwentaToken.allowance(walletAddress, vKwentaRedeemer.address),
			KwentaToken.allowance(walletAddress, KwentaStakingRewards.address),
			MultipleMerkleDistributor.distributionEpoch(),
			veKwentaToken.balanceOf(walletAddress),
			veKwentaToken.allowance(walletAddress, veKwentaRedeemer.address),
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
		const { RewardEscrow: RewardEscrowMulticall } = this.sdk.context.multicallContracts;

		if (!RewardEscrow || !RewardEscrowMulticall) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { walletAddress } = this.sdk.context;

		const schedules = await RewardEscrow.getVestingSchedules(
			walletAddress,
			0,
			DEFAULT_NUMBER_OF_FUTURES_FEE
		);

		const vestingSchedules = schedules.filter((schedule) => schedule.escrowAmount.gt(0));

		const calls = vestingSchedules.map((schedule) =>
			RewardEscrowMulticall.getVestingEntryClaimable(walletAddress, schedule.entryID)
		);

		const vestingEntries: {
			quantity: BigNumber;
			fee: BigNumber;
		}[] = await this.sdk.context.multicallProvider.all(calls);

		const { escrowData, totalVestable } = vestingSchedules.reduce(
			(acc, next, i) => {
				const vestable = wei(vestingEntries[i].quantity);
				const date = Number(next.endTime) * 1000;

				acc.totalVestable = acc.totalVestable.add(vestable);

				acc.escrowData.push({
					id: Number(next.entryID),
					date: moment(date).format('MM/DD/YY'),
					time: formatTruncatedDuration(Number(next.endTime) - new Date().getTime() / 1000),
					vestable,
					amount: wei(next.escrowAmount),
					fee: wei(vestingEntries[i].fee),
					status: date > Date.now() ? 'VESTING' : 'VESTED',
				});

				return acc;
			},
			{ escrowData: [] as EscrowData[], totalVestable: wei(0) }
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

	// TODO: Replace this with separate functions that use `approveToken`
	// In that case, we can safely remove the map object from this method.

	public approveKwentaToken(
		token: 'kwenta' | 'vKwenta' | 'veKwenta',
		amount = ethers.constants.MaxUint256
	) {
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

		return this.sdk.transactions.createContractTxn(contract, 'approve', [spender.address, amount]);
	}

	public approveToken(
		token: ContractName,
		spender?: ContractName,
		amount = ethers.constants.MaxUint256
	) {
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
			amount,
		]);
	}

	public redeemToken(
		token: ContractName,
		options: { hasAddress: boolean } = { hasAddress: false }
	) {
		const tokenContract = this.sdk.context.contracts[token];

		if (!tokenContract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(
			tokenContract,
			'redeem',
			options.hasAddress ? [this.sdk.context.walletAddress] : []
		);
	}

	public redeemVKwenta() {
		return this.redeemToken('vKwentaRedeemer');
	}

	public redeemVeKwenta() {
		return this.redeemToken('veKwentaRedeemer', { hasAddress: true });
	}

	public vestToken(ids: number[]) {
		const { RewardEscrow } = this.sdk.context.contracts;

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		return this.sdk.transactions.createContractTxn(RewardEscrow, 'vest', [ids]);
	}

	public stakeKwenta(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount);
	}

	public unstakeKwenta(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount);
	}

	public stakeEscrowedKwenta(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount, { escrow: true });
	}

	public unstakeEscrowedKwenta(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount, { escrow: true });
	}

	public async getClaimableRewards(epochPeriod: number) {
		const { MultipleMerkleDistributor } = this.sdk.context.multicallContracts;
		const { walletAddress } = this.sdk.context;

		if (!MultipleMerkleDistributor) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const periods = Array.from(new Array(Number(epochPeriod) + 1), (_, i) => i);

		const fileNames = periods
			.slice(0, -1)
			.map(
				(i) =>
					`trading-rewards-snapshots/${
						this.sdk.context.networkId === 420 ? `goerli-` : ''
					}epoch-${i}.json`
			);

		const responses: EpochData[] = await Promise.all(
			fileNames.map(async (fileName, period) => {
				const response = await client.get(fileName);
				return { ...response.data, period };
			})
		);

		const rewards = responses
			.map((d) => {
				const reward = d.claims[walletAddress];

				if (reward) {
					return [reward.index, walletAddress, reward.amount, reward.proof, d.period];
				}

				return null;
			})
			.filter((x): x is ClaimParams => !!x);

		const claimed: boolean[] = await this.sdk.context.multicallProvider.all(
			rewards.map((reward) => MultipleMerkleDistributor.isClaimed(reward[0], reward[4]))
		);

		const { totalRewards, claimableRewards } = rewards.reduce(
			(acc, next, i) => {
				if (!claimed[i]) {
					acc.claimableRewards.push(next);
					acc.totalRewards = acc.totalRewards.add(wei(formatEther(next[2])));
				}

				return acc;
			},
			{ claimableRewards: [] as ClaimParams[], totalRewards: wei(0) }
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

	private performStakeAction(
		action: 'stake' | 'unstake',
		amount: string | BigNumber,
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
