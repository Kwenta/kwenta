import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import {
	ReferralTiers,
	ReferralsRewardsPerCode,
	ReferralsRewardsPerEpoch,
} from 'sections/referrals/types'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'

import {
	checkSelfReferredByCode,
	fetchBoostNftForAccount,
	fetchBoostNftMinted,
	fetchUnmintedBoostNftForCode,
	fetchReferralCodes,
	fetchReferralEpoch,
	fetchReferralNftForAccount,
	fetchReferralScoreForAccount,
} from './action'
import { ReferralsState } from './types'

const ONBOARDING_INITIAL_STATE = {
	mintedBoostNft: false,
	startOnboarding: false,
	isSelfReferred: false,
	unmintedBoostNft: ReferralTiers.INVALID,
	checkReferrerStatus: DEFAULT_QUERY_STATUS,
}

const HOLDER_INITIAL_STATE = {
	boostNft: ReferralTiers.INVALID,
	referralEpoch: [],
	fetchBoostNftStatus: DEFAULT_QUERY_STATUS,
	fetchReferralEpochStatus: DEFAULT_QUERY_STATUS,
}

const REFERRER_INITIAL_STATE = {
	referralNft: ReferralTiers.BRONZE,
	referralScore: 0,
	referralCodes: [],
	fetchReferralNftStatus: DEFAULT_QUERY_STATUS,
	fetchReferralScoreStatus: DEFAULT_QUERY_STATUS,
	fetchReferralCodeStatus: DEFAULT_QUERY_STATUS,
}

export const REFERRALS_INITIAL_STATE: ReferralsState = {
	onboarding: ONBOARDING_INITIAL_STATE,
	holder: HOLDER_INITIAL_STATE,
	referrer: REFERRER_INITIAL_STATE,
}

const referralsSlice = createSlice({
	name: 'referrals',
	initialState: REFERRALS_INITIAL_STATE,
	reducers: {
		setMintedBoostNft: (state, action: PayloadAction<boolean>) => {
			state.onboarding.mintedBoostNft = action.payload
		},
		setStartOnboarding: (state, action: PayloadAction<boolean>) => {
			state.onboarding.startOnboarding = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(checkSelfReferredByCode.pending, (state) => {
			state.onboarding.checkReferrerStatus = LOADING_STATUS
		})
		builder.addCase(checkSelfReferredByCode.fulfilled, (state, action: PayloadAction<boolean>) => {
			state.onboarding.checkReferrerStatus = SUCCESS_STATUS
			state.onboarding.isSelfReferred = action.payload
		})
		builder.addCase(checkSelfReferredByCode.rejected, (state) => {
			state.onboarding.checkReferrerStatus = {
				error: 'Failed to check if user is self-referred',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchUnmintedBoostNftForCode.pending, (state) => {
			state.holder.fetchBoostNftStatus = LOADING_STATUS
		})
		builder.addCase(
			fetchUnmintedBoostNftForCode.fulfilled,
			(state, action: PayloadAction<ReferralTiers>) => {
				state.holder.fetchBoostNftStatus = SUCCESS_STATUS
				state.onboarding.unmintedBoostNft = action.payload
			}
		)
		builder.addCase(fetchUnmintedBoostNftForCode.rejected, (state) => {
			state.holder.fetchBoostNftStatus = {
				error: 'Failed to fetch Boost NFT for referral code',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchBoostNftForAccount.pending, (state) => {
			state.holder.fetchBoostNftStatus = LOADING_STATUS
		})
		builder.addCase(
			fetchBoostNftForAccount.fulfilled,
			(state, action: PayloadAction<ReferralTiers>) => {
				state.holder.fetchBoostNftStatus = SUCCESS_STATUS
				state.holder.boostNft = action.payload
			}
		)
		builder.addCase(fetchBoostNftForAccount.rejected, (state) => {
			state.holder.fetchBoostNftStatus = {
				error: 'Failed to fetch Boost NFT for account',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchBoostNftMinted.fulfilled, (state, action: PayloadAction<boolean>) => {
			state.onboarding.mintedBoostNft = action.payload
		})
		builder.addCase(fetchBoostNftMinted.rejected, (state) => {
			state.onboarding.mintedBoostNft = false
		})
		builder.addCase(fetchBoostNftMinted.pending, (state) => {
			state.onboarding.mintedBoostNft = false
		})
		builder.addCase(
			fetchReferralEpoch.fulfilled,
			(state, action: PayloadAction<ReferralsRewardsPerEpoch[]>) => {
				state.holder.fetchReferralEpochStatus = SUCCESS_STATUS
				state.holder.referralEpoch = action.payload
			}
		)
		builder.addCase(fetchReferralEpoch.pending, (state) => {
			state.holder.fetchReferralEpochStatus = LOADING_STATUS
		})
		builder.addCase(fetchReferralEpoch.rejected, (state) => {
			state.holder.fetchReferralEpochStatus = {
				error: 'Failed to fetch referral rewards per epoch',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchReferralNftForAccount.pending, (state) => {
			state.referrer.fetchReferralNftStatus = LOADING_STATUS
		})
		builder.addCase(
			fetchReferralNftForAccount.fulfilled,
			(state, action: PayloadAction<ReferralTiers>) => {
				state.referrer.fetchReferralNftStatus = SUCCESS_STATUS
				state.referrer.referralNft = action.payload
			}
		)
		builder.addCase(fetchReferralNftForAccount.rejected, (state) => {
			state.referrer.fetchReferralNftStatus = {
				error: 'Failed to fetch referral NFT for account',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(
			fetchReferralScoreForAccount.fulfilled,
			(state, action: PayloadAction<number>) => {
				state.referrer.fetchReferralScoreStatus = SUCCESS_STATUS
				state.referrer.referralScore = action.payload
			}
		)
		builder.addCase(fetchReferralScoreForAccount.pending, (state) => {
			state.referrer.fetchReferralScoreStatus = LOADING_STATUS
		})
		builder.addCase(fetchReferralScoreForAccount.rejected, (state) => {
			state.referrer.fetchReferralScoreStatus = {
				error: 'Failed to fetch referral score for account',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(
			fetchReferralCodes.fulfilled,
			(state, action: PayloadAction<ReferralsRewardsPerCode[]>) => {
				state.referrer.fetchReferralCodeStatus = SUCCESS_STATUS
				state.referrer.referralCodes = action.payload
			}
		)
		builder.addCase(fetchReferralCodes.pending, (state) => {
			state.referrer.fetchReferralCodeStatus = LOADING_STATUS
		})
		builder.addCase(fetchReferralCodes.rejected, (state) => {
			state.referrer.fetchReferralCodeStatus = {
				error: 'Failed to fetch referral codes',
				status: FetchStatus.Error,
			}
		})
	},
})

export default referralsSlice.reducer
export const { setStartOnboarding, setMintedBoostNft } = referralsSlice.actions
