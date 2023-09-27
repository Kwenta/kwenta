import { BigNumber } from '@ethersproject/bignumber'
import { wei } from '@synthetixio/wei'
import { ethers } from 'ethers'
import moment from 'moment'

import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { ETH_COINGECKO_ADDRESS, KWENTA_ADDRESS, OP_ADDRESS } from '../constants/exchange'
import { AGGREGATE_ASSET_KEY, KWENTA_TRACKING_CODE } from '../constants/futures'
import { ZERO_WEI } from '../constants/number'
import { SECONDS_PER_DAY } from '../constants/period'
import {
	DEFAULT_NUMBER_OF_FUTURES_FEE,
	EPOCH_START,
	OP_REWARDS_CUTOFF_EPOCH,
	TRADING_REWARDS_CUTOFF_EPOCH,
	REFERRAL_PROGRAM_START_EPOCH,
	WEEK,
} from '../constants/staking'
import { ContractName } from '../contracts'
import { ClaimParams, EpochData, EscrowData } from '../types/kwentaToken'
import { formatTruncatedDuration } from '../utils/date'
import { awsClient } from '../utils/files'
import { weiFromWei } from '../utils/number'
import { getFuturesAggregateStats, getFuturesTrades } from '../utils/subgraph'
import { calculateFeesForAccount, calculateTotalFees } from '../utils'
import { ADDRESSES } from '../constants'

export default class KwentaTokenService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	public changePoolTokens(amount: string, action: 'stake' | 'withdraw') {
		if (!this.sdk.context.contracts.StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.StakingRewards,
			action,
			[wei(amount).toBN()]
		)
	}

	public approveLPToken() {
		return this.approveToken('KwentaArrakisVault', 'StakingRewards')
	}

	public async getEarnDetails() {
		const { StakingRewards, KwentaArrakisVault } = this.sdk.context.multicallContracts

		if (!StakingRewards || !KwentaArrakisVault) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		const [
			balance,
			earned,
			periodFinish,
			rewardRate,
			totalSupply,
			lpTokenBalance,
			allowance,
			[wethAmount, kwentaAmount],
			lpTotalSupply,
		]: any[] = await this.sdk.context.multicallProvider.all([
			StakingRewards.balanceOf(walletAddress),
			StakingRewards.earned(walletAddress),
			StakingRewards.periodFinish(),
			StakingRewards.rewardRate(),
			StakingRewards.totalSupply(),
			KwentaArrakisVault.balanceOf(walletAddress),
			KwentaArrakisVault.allowance(walletAddress, StakingRewards.address),
			KwentaArrakisVault.getUnderlyingBalances(),
			KwentaArrakisVault.totalSupply(),
		])

		return {
			balance: wei(balance),
			earned: wei(earned),
			endDate: periodFinish.toNumber(),
			rewardRate: wei(rewardRate),
			totalSupply: wei(totalSupply),
			lpTokenBalance: wei(lpTokenBalance),
			allowance: wei(allowance),
			wethAmount: wei(wethAmount),
			kwentaAmount: wei(kwentaAmount),
			lpTotalSupply: wei(lpTotalSupply),
		}
	}

	public async getEarnTokenPrices() {
		const coinGeckoPrices = await this.sdk.exchange.batchGetCoingeckoPrices(
			[KWENTA_ADDRESS, ETH_COINGECKO_ADDRESS, OP_ADDRESS],
			false
		)

		return {
			kwentaPrice: coinGeckoPrices ? wei(coinGeckoPrices[KWENTA_ADDRESS]?.usd) : ZERO_WEI,
			wethPrice: coinGeckoPrices ? wei(coinGeckoPrices[ETH_COINGECKO_ADDRESS]?.usd) : ZERO_WEI,
			opPrice: coinGeckoPrices ? wei(coinGeckoPrices[OP_ADDRESS]?.usd) : ZERO_WEI,
		}
	}

	public claimRewards() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards

		if (!StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(StakingRewards, 'getReward', [])
	}

	public async getStakingData() {
		const { vKwentaRedeemer, veKwentaRedeemer } = this.sdk.context.contracts

		const {
			RewardEscrow,
			KwentaStakingRewards,
			KwentaToken,
			SupplySchedule,
			vKwentaToken,
			veKwentaToken,
			MultipleMerkleDistributor,
		} = this.sdk.context.multicallContracts

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
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress, networkId } = this.sdk.context

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
			vKwentaToken.allowance(walletAddress, ADDRESSES.vKwentaRedeemer[networkId]),
			KwentaToken.allowance(walletAddress, ADDRESSES.KwentaStakingRewards[networkId]),
			veKwentaToken.balanceOf(walletAddress),
			veKwentaToken.allowance(walletAddress, ADDRESSES.veKwentaRedeemer[networkId]),
		])

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
			epochPeriod: Math.floor((Math.floor(Date.now() / 1000) - EPOCH_START[10]) / WEEK),
			veKwentaBalance: wei(veKwentaBalance),
			veKwentaAllowance: wei(veKwentaAllowance),
		}
	}

	public async getStakingV2Data() {
		const { RewardEscrowV2, KwentaStakingRewardsV2, KwentaToken, SupplySchedule } =
			this.sdk.context.multicallContracts

		if (!RewardEscrowV2 || !KwentaStakingRewardsV2 || !KwentaToken || !SupplySchedule) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress, networkId } = this.sdk.context

		const [
			rewardEscrowBalance,
			stakedNonEscrowedBalance,
			stakedEscrowedBalance,
			claimableBalance,
			totalStakedBalance,
			lastStakedTime,
			cooldownPeriod,
			kwentaStakingV2Allowance,
		]: BigNumber[] = await this.sdk.context.multicallProvider.all([
			RewardEscrowV2.escrowedBalanceOf(walletAddress),
			KwentaStakingRewardsV2.nonEscrowedBalanceOf(walletAddress),
			KwentaStakingRewardsV2.escrowedBalanceOf(walletAddress),
			KwentaStakingRewardsV2.earned(walletAddress),
			KwentaStakingRewardsV2.totalSupply(),
			KwentaStakingRewardsV2.userLastStakeTime(walletAddress),
			KwentaStakingRewardsV2.cooldownPeriod(),
			KwentaToken.allowance(walletAddress, ADDRESSES.KwentaStakingRewardsV2[networkId]),
		])

		return {
			rewardEscrowBalance: wei(rewardEscrowBalance),
			stakedNonEscrowedBalance: wei(stakedNonEscrowedBalance),
			stakedEscrowedBalance: wei(stakedEscrowedBalance),
			claimableBalance: wei(claimableBalance),
			totalStakedBalance: wei(totalStakedBalance),
			stakedResetTime: Number(lastStakedTime) + Number(cooldownPeriod),
			kwentaStakingV2Allowance: wei(kwentaStakingV2Allowance),
		}
	}

	public async getEscrowData() {
		const { RewardEscrow } = this.sdk.context.contracts
		const { RewardEscrow: RewardEscrowMulticall } = this.sdk.context.multicallContracts

		if (!RewardEscrow || !RewardEscrowMulticall) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		const schedules = await RewardEscrow.getVestingSchedules(
			walletAddress,
			0,
			DEFAULT_NUMBER_OF_FUTURES_FEE
		)

		const vestingSchedules = schedules.filter((schedule) => schedule.escrowAmount.gt(0))

		const calls = vestingSchedules.map((schedule) =>
			RewardEscrowMulticall.getVestingEntryClaimable(walletAddress, schedule.entryID)
		)

		const vestingEntries: {
			quantity: BigNumber
			fee: BigNumber
		}[] = await this.sdk.context.multicallProvider.all(calls)

		const { escrowData, totalVestable } = vestingSchedules.reduce(
			(acc, next, i) => {
				const vestable = wei(vestingEntries[i].quantity)
				const date = Number(next.endTime) * 1000

				acc.totalVestable = acc.totalVestable.add(vestable)

				acc.escrowData.push({
					id: Number(next.entryID),
					date: moment(date).format('MM/DD/YY'),
					time: formatTruncatedDuration(Number(next.endTime) - new Date().getTime() / 1000),
					vestable,
					amount: wei(next.escrowAmount),
					fee: wei(vestingEntries[i].fee),
					status: date > Date.now() ? 'Vesting' : 'Vested',
					version: 1,
				})

				return acc
			},
			{ escrowData: [] as EscrowData[], totalVestable: wei(0) }
		)

		return { escrowData, totalVestable }
	}

	public async getEscrowV2Data() {
		const { RewardEscrowV2 } = this.sdk.context.contracts
		const { RewardEscrowV2: RewardEscrowMulticall } = this.sdk.context.multicallContracts

		if (!RewardEscrowV2 || !RewardEscrowMulticall) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		const schedules = await RewardEscrowV2.getVestingSchedules(
			walletAddress,
			0,
			DEFAULT_NUMBER_OF_FUTURES_FEE
		)

		const vestingSchedules = schedules.filter((schedule) => schedule.escrowAmount.gt(0))

		const calls = vestingSchedules.map((schedule) =>
			RewardEscrowMulticall.getVestingEntryClaimable(schedule.entryID)
		)

		const vestingEntries: {
			quantity: BigNumber
			fee: BigNumber
		}[] = await this.sdk.context.multicallProvider.all(calls)

		const { escrowData, totalVestable } = vestingSchedules.reduce(
			(acc, next, i) => {
				const vestable = wei(vestingEntries[i].quantity)
				const date = Number(next.endTime) * 1000

				acc.totalVestable = acc.totalVestable.add(vestable)

				acc.escrowData.push({
					id: Number(next.entryID),
					date: moment(date).format('MM/DD/YY'),
					time: formatTruncatedDuration(Number(next.endTime) - new Date().getTime() / 1000),
					vestable,
					amount: wei(next.escrowAmount),
					fee: wei(vestingEntries[i].fee),
					status: date > Date.now() ? 'Vesting' : 'Vested',
					version: 2,
				})

				return acc
			},
			{ escrowData: [] as EscrowData[], totalVestable: wei(0) }
		)

		return { escrowData, totalVestable }
	}

	public claimStakingRewards() {
		const { KwentaStakingRewards } = this.sdk.context.contracts

		if (!KwentaStakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(KwentaStakingRewards, 'getReward', [])
	}

	public claimStakingRewardsV2() {
		const { KwentaStakingRewardsV2 } = this.sdk.context.contracts

		if (!KwentaStakingRewardsV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(KwentaStakingRewardsV2, 'getReward', [])
	}

	public compoundRewards() {
		const { KwentaStakingRewardsV2 } = this.sdk.context.contracts

		if (!KwentaStakingRewardsV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(KwentaStakingRewardsV2, 'compound', [])
	}

	// TODO: Replace this with separate functions that use `approveToken`
	// In that case, we can safely remove the map object from this method.

	public approveKwentaToken(
		token: 'kwenta' | 'vKwenta' | 'veKwenta' | 'kwentaStakingV2',
		amount = ethers.constants.MaxUint256
	) {
		const {
			KwentaToken,
			KwentaStakingRewards,
			vKwentaToken,
			vKwentaRedeemer,
			veKwentaToken,
			veKwentaRedeemer,
			KwentaStakingRewardsV2,
		} = this.sdk.context.contracts

		const map = {
			kwenta: { contract: KwentaToken, spender: KwentaStakingRewards },
			vKwenta: { contract: vKwentaToken, spender: vKwentaRedeemer },
			veKwenta: { contract: veKwentaToken, spender: veKwentaRedeemer },
			kwentaStakingV2: { contract: KwentaToken, spender: KwentaStakingRewardsV2 },
		}

		const { contract, spender } = map[token]

		if (!contract || !spender) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(contract, 'approve', [spender.address, amount])
	}

	public approveToken(
		token: ContractName,
		spender?: ContractName,
		amount = ethers.constants.MaxUint256
	) {
		const tokenContract = this.sdk.context.contracts[token]

		if (!tokenContract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		let spenderAddress = this.sdk.context.walletAddress

		if (spender) {
			const spenderContract = this.sdk.context.contracts[spender]
			if (spenderContract) spenderAddress = spenderContract.address
		}

		return this.sdk.transactions.createContractTxn(tokenContract, 'approve', [
			spenderAddress,
			amount,
		])
	}

	public redeemToken(
		token: ContractName,
		options: { hasAddress: boolean } = { hasAddress: false }
	) {
		const tokenContract = this.sdk.context.contracts[token]

		if (!tokenContract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(
			tokenContract,
			'redeem',
			options.hasAddress ? [this.sdk.context.walletAddress] : []
		)
	}

	public redeemVKwenta() {
		return this.redeemToken('vKwentaRedeemer')
	}

	public redeemVeKwenta() {
		return this.redeemToken('veKwentaRedeemer', { hasAddress: true })
	}

	public vestToken(ids: number[]) {
		const { RewardEscrow } = this.sdk.context.contracts

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(RewardEscrow, 'vest', [ids])
	}

	public vestTokenV2(ids: number[]) {
		const { RewardEscrowV2 } = this.sdk.context.contracts

		if (!RewardEscrowV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(RewardEscrowV2, 'vest', [ids])
	}

	public stakeKwenta(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount)
	}

	public unstakeKwenta(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount, { escrow: false, version: 1 })
	}

	public stakeEscrowedKwenta(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount, { escrow: true, version: 1 })
	}

	public unstakeEscrowedKwenta(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount, { escrow: true, version: 1 })
	}

	public stakeKwentaV2(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount, { escrow: false, version: 2 })
	}

	public unstakeKwentaV2(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount, { escrow: false, version: 2 })
	}

	public stakeEscrowedKwentaV2(amount: string | BigNumber) {
		return this.performStakeAction('stake', amount, { escrow: true, version: 2 })
	}

	public unstakeEscrowedKwentaV2(amount: string | BigNumber) {
		return this.performStakeAction('unstake', amount, { escrow: true, version: 2 })
	}

	public async getEstimatedRewards() {
		const { networkId, walletAddress } = this.sdk.context
		const fileNames = ['', '-op'].map(
			(i) => `/${networkId === 420 ? 'goerli-' : ''}epoch-current${i}.json`
		)

		const responses: EpochData[] = await Promise.all(
			fileNames.map(async (fileName) => {
				const response = await awsClient.get(fileName)
				return { ...response.data }
			})
		)

		const [estimatedKwentaRewards, estimatedOpRewards] = responses.map((d) => {
			const reward = d.claims[walletAddress]

			if (reward) {
				return weiFromWei(reward.amount)
			}

			return ZERO_WEI
		})

		return { estimatedKwentaRewards, estimatedOpRewards }
	}

	public async getClaimableRewards(epochPeriod: number) {
		const { MultipleMerkleDistributorPerpsV2 } = this.sdk.context.multicallContracts
		const { walletAddress } = this.sdk.context

		if (!MultipleMerkleDistributorPerpsV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const periods = Array.from(new Array(Number(epochPeriod)), (_, i) => i)
		const adjustedPeriods = periods.slice(TRADING_REWARDS_CUTOFF_EPOCH)

		const fileNames = adjustedPeriods.map(
			(i) => `${this.sdk.context.networkId === 420 ? `goerli-` : ''}epoch-${i}.json`
		)

		const responses: EpochData[] = await Promise.all(
			fileNames.map(async (fileName, index) => {
				const response = await awsClient.get(fileName)
				const period = index + TRADING_REWARDS_CUTOFF_EPOCH
				return { ...response.data, period }
			})
		)

		const rewards = responses
			.map((d) => {
				const reward = d.claims[walletAddress]

				if (reward) {
					return [reward.index, walletAddress, reward.amount, reward.proof, d.period]
				}

				return null
			})
			.filter((x): x is ClaimParams => !!x)

		const claimed: boolean[] = await this.sdk.context.multicallProvider.all(
			rewards.map((reward) => MultipleMerkleDistributorPerpsV2.isClaimed(reward[0], reward[4]))
		)

		const { totalRewards, claimableRewards } = rewards.reduce(
			(acc, next, i) => {
				if (!claimed[i]) {
					acc.claimableRewards.push(next)
					acc.totalRewards = acc.totalRewards.add(weiFromWei(next[2]))
				}

				return acc
			},
			{ claimableRewards: [] as ClaimParams[], totalRewards: wei(0) }
		)

		return { claimableRewards, totalRewards }
	}

	public async getClaimableAllRewards(
		epochPeriod: number,
		isOp: boolean = false,
		isSnx: boolean = false,
		cutoffPeriod: number = 0
	) {
		const {
			MultipleMerkleDistributorPerpsV2,
			MultipleMerkleDistributorOp,
			MultipleMerkleDistributorSnxOp,
		} = this.sdk.context.multicallContracts
		const { walletAddress } = this.sdk.context

		if (
			!MultipleMerkleDistributorPerpsV2 ||
			!MultipleMerkleDistributorOp ||
			!MultipleMerkleDistributorSnxOp
		) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const periods = Array.from(new Array(Number(epochPeriod)), (_, i) => i)

		const adjustedPeriods = isOp
			? periods.slice(OP_REWARDS_CUTOFF_EPOCH)
			: periods.slice(TRADING_REWARDS_CUTOFF_EPOCH)

		const fileNames = adjustedPeriods.map(
			(i) =>
				`${this.sdk.context.networkId === 420 ? `goerli-` : ''}epoch-${
					isSnx ? i - OP_REWARDS_CUTOFF_EPOCH : i
				}${isOp ? (isSnx ? '-snx-op' : '-op') : ''}.json`
		)

		const responses: EpochData[] = await Promise.all(
			fileNames.map(async (fileName, index) => {
				try {
					if (index < cutoffPeriod) return null
					const response = await awsClient.get(fileName)
					const period = isOp
						? isSnx
							? index
							: index + OP_REWARDS_CUTOFF_EPOCH
						: index + TRADING_REWARDS_CUTOFF_EPOCH
					return { ...response.data, period }
				} catch (err) {
					this.sdk.context.logError(err)
					return null
				}
			})
		)

		const rewards = responses
			.filter(Boolean)
			.map((d) => {
				const reward = d.claims[walletAddress]

				if (reward) {
					return [reward.index, walletAddress, reward.amount, reward.proof, d.period]
				}

				return null
			})
			.filter((x): x is ClaimParams => !!x)

		const claimed: boolean[] = await this.sdk.context.multicallProvider.all(
			rewards.map((reward) =>
				isOp
					? isSnx
						? MultipleMerkleDistributorSnxOp.isClaimed(reward[0], reward[4])
						: MultipleMerkleDistributorOp.isClaimed(reward[0], reward[4])
					: MultipleMerkleDistributorPerpsV2.isClaimed(reward[0], reward[4])
			)
		)

		const { totalRewards, claimableRewards } = rewards.reduce(
			(acc, next, i) => {
				if (!claimed[i]) {
					acc.claimableRewards.push(next)
					acc.totalRewards = acc.totalRewards.add(weiFromWei(next[2]))
				}

				return acc
			},
			{ claimableRewards: [] as ClaimParams[], totalRewards: wei(0) }
		)

		return { claimableRewards, totalRewards }
	}

	public async getKwentaRewardsByEpoch(epochPeriod: number) {
		const { walletAddress } = this.sdk.context

		const fileName = `${
			this.sdk.context.networkId === 420 ? `goerli-` : ''
		}epoch-${epochPeriod}.json`

		try {
			const response = await awsClient.get(fileName)
			const rewards = response.data.claims[walletAddress]
			return rewards ? weiFromWei(rewards.amount) : ZERO_WEI
		} catch (err) {
			this.sdk.context.logError(err)
			return ZERO_WEI
		}
	}

	public async getKwentaRewardsByTraders(epochPeriod: number, traders: string[]) {
		const periods = Array.from(new Array(Number(epochPeriod)), (_, i) => i)
		const adjustedPeriods = periods.slice(REFERRAL_PROGRAM_START_EPOCH)
		const fileNames = adjustedPeriods.map(
			(i) => `${this.sdk.context.networkId === 420 ? `goerli-` : ''}epoch-${i}.json`
		)

		try {
			const responses: EpochData[] = await Promise.all(
				fileNames.map(async (fileName) => {
					try {
						const response = await awsClient.get(fileName)
						return { ...response.data }
					} catch (err) {
						this.sdk.context.logError(err)
						return null
					}
				})
			)

			const rewards = traders.map((walletAddress) => {
				const lowerCaseWalletAddress = walletAddress.toLowerCase()
				return responses
					.filter(Boolean)
					.map(({ claims }) => {
						const lowerCaseClaims = Object.fromEntries(
							Object.entries(claims).map(([key, value]) => [key.toLowerCase(), value])
						)
						const reward = lowerCaseClaims[lowerCaseWalletAddress]
						return reward ? reward.amount : '0'
					})
					.reduce((acc, amount) => (amount ? acc.add(weiFromWei(amount)) : acc), ZERO_WEI)
			})
			return rewards
				.flat()
				.reduce((total, next) => (next ? total.add(weiFromWei(next)) : total), ZERO_WEI)
		} catch (err) {
			this.sdk.context.logError(err)
			return ZERO_WEI
		}
	}

	public async claimKwentaRewards(claimableRewards: ClaimParams[]) {
		const { MultipleMerkleDistributorPerpsV2 } = this.sdk.context.contracts

		if (!MultipleMerkleDistributorPerpsV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(
			MultipleMerkleDistributorPerpsV2,
			'claimMultiple',
			[claimableRewards]
		)
	}

	public async claimMultipleAllRewards(claimableRewards: ClaimParams[][]) {
		const {
			BatchClaimer,
			MultipleMerkleDistributorPerpsV2,
			MultipleMerkleDistributorOp,
			MultipleMerkleDistributorSnxOp,
		} = this.sdk.context.contracts

		if (
			!BatchClaimer ||
			!MultipleMerkleDistributorPerpsV2 ||
			!MultipleMerkleDistributorOp ||
			!MultipleMerkleDistributorSnxOp
		) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(BatchClaimer, 'claimMultiple', [
			[
				MultipleMerkleDistributorPerpsV2.address,
				MultipleMerkleDistributorOp.address,
				MultipleMerkleDistributorSnxOp.address,
			],
			claimableRewards,
		])
	}

	public async claimOpRewards(claimableRewards: ClaimParams[], isSnx: boolean = false) {
		const { MultipleMerkleDistributorOp, MultipleMerkleDistributorSnxOp } =
			this.sdk.context.contracts

		if (!MultipleMerkleDistributorOp || !MultipleMerkleDistributorSnxOp) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(
			isSnx ? MultipleMerkleDistributorSnxOp : MultipleMerkleDistributorOp,
			'claimMultiple',
			[claimableRewards]
		)
	}

	public async getFuturesFee(start: number, end: number) {
		if (!this.sdk.context.isL2) {
			throw new Error(sdkErrors.REQUIRES_L2)
		}

		const response = await getFuturesAggregateStats(
			this.sdk.futures.futuresGqlEndpoint,
			{
				first: DEFAULT_NUMBER_OF_FUTURES_FEE,
				where: {
					asset: AGGREGATE_ASSET_KEY,
					period: SECONDS_PER_DAY,
					timestamp_gte: start,
					timestamp_lt: end,
				},
				orderDirection: 'desc',
				orderBy: 'timestamp',
			},
			{ feesKwenta: true }
		)

		return response ? calculateTotalFees(response) : wei(0)
	}

	public async getFuturesFeeForAccount(account: string, start: number, end: number) {
		if (!account) return wei(0)

		const response = await getFuturesTrades(
			this.sdk.futures.futuresGqlEndpoint,
			{
				first: DEFAULT_NUMBER_OF_FUTURES_FEE,
				where: {
					account: account,
					timestamp_gt: start,
					timestamp_lt: end,
					trackingCode: KWENTA_TRACKING_CODE,
				},
				orderDirection: 'desc',
				orderBy: 'timestamp',
			},
			{
				feesPaid: true,
				keeperFeesPaid: true,
			}
		)

		return response ? calculateFeesForAccount(response) : wei(0)
	}

	private performStakeAction(
		action: 'stake' | 'unstake',
		amount: string | BigNumber,
		options: { escrow: boolean; version?: number } = { escrow: false, version: 1 }
	) {
		const { RewardEscrow, RewardEscrowV2, KwentaStakingRewards, KwentaStakingRewardsV2 } =
			this.sdk.context.contracts

		if (!RewardEscrow || !RewardEscrowV2 || !KwentaStakingRewards || !KwentaStakingRewardsV2) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const contract =
			options?.version === 1
				? options?.escrow
					? RewardEscrow
					: KwentaStakingRewards
				: KwentaStakingRewardsV2

		return this.sdk.transactions.createContractTxn(
			contract,
			`${action}${options?.escrow ? 'Escrow' : ''}`,
			[amount]
		)
	}
}
