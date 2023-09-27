import { REFERRAL_PROGRAM_START_EPOCH } from '@kwenta/sdk/constants'
import { TransactionStatus } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { notifyError } from 'components/ErrorNotifier'
import { REFFERAL_TIERS } from 'sections/referrals/constants'
import {
	ReferralTiers,
	ReferralsRewardsPerCode,
	ReferralsRewardsPerEpoch,
} from 'sections/referrals/types'
import { calculateTotal } from 'sections/referrals/utils'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setOpenModal, setTransaction } from 'state/app/reducer'
import {
	selectEpochData,
	selectEpochPeriod,
	selectTradingRewardsSupportedNetwork,
} from 'state/staking/selectors'
import { ThunkConfig } from 'state/types'
import { selectWallet } from 'state/wallet/selectors'
import logError from 'utils/logError'

import { setMintedBoostNft } from './reducer'

export const mintBoostNft = createAsyncThunk<void, string, ThunkConfig>(
	'referrals/mintBoostNft',
	async (referralCode, { dispatch, getState, extra: { sdk } }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectTradingRewardsSupportedNetwork(getState())

		try {
			if (!wallet) throw new Error('Wallet not connected')
			if (!supportedNetwork)
				throw new Error(
					'Minting Boost NFT is unsupported on this network. Please switch to Optimism.'
				)

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'mint_boost_nft',
					hash: null,
				})
			)

			const tx = await sdk.referrals.mintBoostNft(referralCode)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchBoostNftForAccount())
			dispatch(setMintedBoostNft(true))
		} catch (err) {
			logError(err)
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const createNewReferralCode = createAsyncThunk<void, string, ThunkConfig>(
	'referrals/createReferralCode',
	async (referralCode, { dispatch, getState, extra: { sdk } }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectTradingRewardsSupportedNetwork(getState())

		try {
			if (!wallet) throw new Error('Wallet not connected')
			if (!supportedNetwork)
				throw new Error(
					'Creating new code is unsupported on this network. Please switch to Optimism.'
				)

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'register_referral_code',
					hash: null,
				})
			)
			const tx = await sdk.referrals.registerReferralCode(referralCode)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchReferralCodes())
			dispatch(setOpenModal(null))
		} catch (err) {
			logError(err)
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const fetchUnmintedBoostNftForCode = createAsyncThunk<ReferralTiers, string, ThunkConfig>(
	'referrals/fetchUnmintedBoostNftForCode',
	async (code, { getState, extra: { sdk } }) => {
		const supportedNetwork = selectTradingRewardsSupportedNetwork(getState())

		try {
			if (!supportedNetwork)
				throw new Error('Boost NFT is unsupported on this network. Please switch to Optimism.')
			return await sdk.referrals.getTierByReferralCode(code)
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch Boost NFT for referral code.', err)
			return ReferralTiers.INVALID
		}
	}
)

export const checkSelfReferredByCode = createAsyncThunk<boolean, string, ThunkConfig>(
	'referrals/fetchReferrerByCode',
	async (code, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			const owner = await sdk.referrals.getReferrerByCode(code)
			return wallet && owner ? wallet.toLowerCase() === owner.toLowerCase() : false
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch referrer by referral code.', err)
			return false
		}
	}
)

export const fetchBoostNftForAccount = createAsyncThunk<ReferralTiers, void, ThunkConfig>(
	'referrals/fetchTraderNftForAccount',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) return ReferralTiers.INVALID
			return await sdk.referrals.getBoostNftTierByHolder(wallet)
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch Boost NFT for account', err)
			return ReferralTiers.INVALID
		}
	}
)

export const fetchBoostNftMinted = createAsyncThunk<boolean, void, ThunkConfig>(
	'referrals/fetchBoostNftMinted',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) return false
			return await sdk.referrals.checkNftMintedForAccount(wallet)
		} catch (err) {
			logError(err)
			notifyError('Failed to check Boost NFT for account', err)
			return false
		}
	}
)

export const fetchReferralEpoch = createAsyncThunk<ReferralsRewardsPerEpoch[], void, ThunkConfig>(
	'referrals/fetchReferralEpoch',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) return []
			const epochData = selectEpochData(getState())
			if (!epochData) return []
			const epochPeriod = selectEpochPeriod(getState())
			const statsPerEpoch: ReferralsRewardsPerEpoch[] = await Promise.all(
				epochData.slice(REFERRAL_PROGRAM_START_EPOCH).map(async ({ period, start, end }) => {
					const referralEpoch = await sdk.referrals.getCumulativeStatsByReferrerAndEpochTime(
						wallet,
						start,
						end
					)

					const kwentaRewards =
						period !== Number(epochPeriod)
							? await sdk.kwentaToken.getKwentaRewardsByEpoch(period)
							: wei(0)
					const referralVolume = calculateTotal(referralEpoch, 'referralVolume')
					const referredCount = calculateTotal(referralEpoch, 'referredCount')

					return {
						epoch: period.toString(),
						referralVolume: referralVolume.toString(),
						referredCount: referredCount.toString(),
						earnedRewards: kwentaRewards.toString(),
					}
				})
			)

			return statsPerEpoch
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch referral rewards per epoch', err)
			return []
		}
	}
)

export const fetchReferralNftForAccount = createAsyncThunk<ReferralTiers, void, ThunkConfig>(
	'referrals/fetchReferralNft',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) return ReferralTiers.BRONZE
			const tier = await sdk.referrals.getReferralNftTierByReferrer(wallet)
			return tier ?? ReferralTiers.BRONZE
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch Referral NFT for account', err)
			return ReferralTiers.BRONZE
		}
	}
)

export const fetchReferralScoreForAccount = createAsyncThunk<number, void, ThunkConfig>(
	'referrals/fetchReferralScoreForAccount',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) return 0
			const score = await sdk.referrals.getReferralScoreByReferrer(wallet)
			const maxScore = REFFERAL_TIERS[ReferralTiers.GOLD].threshold
			return Math.min(maxScore, wei(score).toNumber()) ?? 0
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch referral score for account', err)
			return 0
		}
	}
)

export const fetchReferralCodes = createAsyncThunk<ReferralsRewardsPerCode[], void, ThunkConfig>(
	'referrals/fetchReferralCodes',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			const period = Number(selectEpochPeriod(getState()))
			if (!wallet || !period) return []
			return await sdk.referrals.getCumulativeStatsByReferrerAndEpoch(wallet, period)
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch cumulative stats by referral codes', err)
			return []
		}
	}
)

export const fetchAllReferralData = createAsyncThunk<void, void, ThunkConfig>(
	'referrals/fetchAllReferralData',
	async (_, { dispatch }) => {
		dispatch(fetchBoostNftMinted())
		dispatch(fetchBoostNftForAccount())
		dispatch(fetchReferralScoreForAccount())
		dispatch(fetchReferralNftForAccount())
		dispatch(fetchReferralCodes())
		dispatch(fetchReferralEpoch())
	}
)
