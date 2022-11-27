import { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Contract as EthCallContract } from 'ethcall';
import { ethers } from 'ethers';
import moment from 'moment';
import KwentaSDK from 'sdk';

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from 'queries/files/constants';
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

type EpochDataProps = {
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
		const { StakingRewards, KwentaArrakisVault } = this.sdk.context.contracts;

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
			KwentaToken,
			SupplySchedule,
			vKwentaToken,
			MultipleMerkleDistributor,
			veKwentaToken,
			KwentaStakingRewards,
		} = this.sdk.context.contracts;

		if (
			!RewardEscrow ||
			!KwentaStakingRewards ||
			!KwentaToken ||
			!SupplySchedule ||
			!vKwentaToken ||
			!MultipleMerkleDistributor ||
			!veKwentaToken
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
			KwentaStakingRewardsContract.nonEscrowedBalanceOf(),
			KwentaStakingRewardsContract.escrowedBalanceOf(),
			KwentaStakingRewardsContract.earned(),
			KwentaTokenContract.balanceOf(),
			SupplyScheduleContract.weekCounter(),
			KwentaStakingRewardsContract.totalSupply(),
			vKwentaTokenContract.balanceOf(),
			vKwentaTokenContract.allowance(),
			KwentaTokenContract.allowance(),
			MultipleMerkleDistributorContract.distributionEpoch(),
			veKwentaTokenContract.balanceOf(),
			veKwentaTokenContract.allowance(),
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

		const calls = [];

		for (const schedule of vestingSchedules) {
			calls.push(
				RewardEscrowContract.getVestingEntryClaimable(
					this.sdk.context.walletAddress,
					schedule.entryID
				)
			);
		}

		const vestingEntries: {
			quantity: ethers.BigNumber;
			fee: ethers.BigNumber;
		}[] = await this.sdk.context.multicallProvider.all(calls);

		const escrowData = [];

		let totalVestable = 0;

		for (let i = 0; i < vestingSchedules.length; i++) {
			const vestable = Number(ethers.utils.formatEther(vestingEntries[i].quantity));
			const date = Number(vestingSchedules[i].endTime) * 1000;

			totalVestable += vestable;

			escrowData[i] = {
				id: Number(vestingSchedules[i].entryID),
				date: moment(date).format('MM/DD/YY'),
				time: formatTruncatedDuration(
					Number(vestingSchedules[i].endTime) - new Date().getTime() / 1000
				),
				vestable,
				amount: Number(ethers.utils.formatEther(vestingSchedules[i].escrowAmount)),
				fee: Number(ethers.utils.formatEther(vestingEntries[i].fee)),
				status: date > Date.now() ? 'VESTING' : 'VESTED',
			};
		}

		return { escrowData, totalVestable };
	}

	public async getReward() {
		const { KwentaStakingRewards } = this.sdk.context.contracts;

		if (!KwentaStakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(
			KwentaStakingRewards,
			'getReward',
			[]
		);

		return hash;
	}

	// TODO: Delete `approveLPToken` method.
	// Also, consider creating a generic service called 'util' or something,
	// that has handy methods for approving, redeeming etc.
	// Signature: approveToken(contract: ContractName, spender?: ContractName)
	// spender should default to walletAddress.
	// In that case, we can safely remove the map object from this method.

	public async approveKwentaToken(token: 'kwenta' | 'vKwenta' | 'veKwenta') {
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

		const { hash } = await this.sdk.transactions.createContractTxn(contract, 'approve', [
			spender.address,
			ethers.constants.MaxUint256,
		]);

		return hash;
	}

	public async redeemToken(token: 'vKwenta' | 'veKwenta') {
		const { vKwentaRedeemer, veKwentaRedeemer } = this.sdk.context.contracts;

		if (!vKwentaRedeemer || !veKwentaRedeemer) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const contract = token === 'vKwenta' ? vKwentaRedeemer : veKwentaRedeemer;

		const { hash } = await this.sdk.transactions.createContractTxn(contract, 'redeem', [
			this.sdk.context.walletAddress,
		]);

		return hash;
	}

	public async vestToken(ids: number[]) {
		const { RewardEscrow } = this.sdk.context.contracts;

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(RewardEscrow, 'vest', [ids]);

		return hash;
	}

	// TODO: Rename this and refactor.
	public async performStakeAction(
		action: 'stake' | 'unstake',
		amount: string,
		options: { escrow: boolean } = { escrow: true }
	) {
		const { RewardEscrow, KwentaStakingRewards } = this.sdk.context.contracts;

		if (!RewardEscrow || !KwentaStakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const contract = options?.escrow ? RewardEscrow : KwentaStakingRewards;

		const { hash } = await this.sdk.transactions.createContractTxn(
			contract,
			`${action}${options?.escrow ? 'Escrow' : ''}`,
			[amount]
		);

		return hash;
	}

	public async getClaimableRewards(periods: number[]) {
		const fileNames = periods
			.slice(0, -1)
			.map(
				(i) =>
					`trading-rewards-snapshots/${
						this.sdk.context.networkId === 420 ? `goerli-` : ''
					}epoch-${i}.json`
			);

		const responses = [];

		for (const fileName of fileNames) {
			const response = await client.get(fileName);
			responses.push(response.data ?? null);
		}

		const rewards: ClaimParams[] = responses
			.map((d: EpochDataProps, period) => {
				const index = Object.keys(d.claims).findIndex(
					(key) => key === this.sdk.context.walletAddress
				);

				if (index !== -1) {
					const walletReward = Object.values(d.claims)[index];
					if (!!walletReward) {
						return [
							walletReward.index,
							this.sdk.context.walletAddress,
							walletReward.amount,
							walletReward.proof,
							period,
						];
					}
				}

				return null;
			})
			.filter((x): x is ClaimParams => !!x);

		const calls = [];

		const { MultipleMerkleDistributor } = this.sdk.context.contracts;

		if (!MultipleMerkleDistributor) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const MultipleMerkleDistributorContract = new EthCallContract(
			MultipleMerkleDistributor.address,
			MultipleMerkleDistributorABI
		);

		for (const reward of rewards) {
			calls.push(MultipleMerkleDistributorContract.isClaimed(reward[0], reward[4]));
		}

		const claimed: boolean[] = await this.sdk.context.multicallProvider.all(calls);

		const claimableRewards = [];

		const rewardsLength = rewards.length;
		let totalRewards = 0;

		for (let i = 0; i < rewardsLength; i++) {
			if (!claimed[i]) {
				const reward = rewards[i];
				claimableRewards.push(reward);
				totalRewards += Number(reward[2]) / 1e18;
			}
		}

		return { rewards, claimableRewards, totalRewards };
	}

	public async claimMultipleRewards(claimableRewards: ClaimParams[]) {
		const { MultipleMerkleDistributor } = this.sdk.context.contracts;

		if (!MultipleMerkleDistributor) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(
			MultipleMerkleDistributor,
			'claimMultiple',
			[claimableRewards]
		);

		return hash;
	}
}
