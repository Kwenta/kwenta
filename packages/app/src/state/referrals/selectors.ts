import { TransactionStatus } from '@kwenta/sdk/types'
import { createSelector } from '@reduxjs/toolkit'

import { ReferralTiers } from 'sections/referrals/types'
import { calculateTotal } from 'sections/referrals/utils'
import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'
import { selectWallet } from 'state/wallet/selectors'

export const selectMintedBoostNft = (state: RootState) => state.referrals.onboarding.mintedBoostNft

export const selectStartOnboarding = (state: RootState) =>
	state.referrals.onboarding.startOnboarding

export const selectUnmintedBoostNft = (state: RootState) =>
	state.referrals.onboarding.unmintedBoostNft ?? ReferralTiers.INVALID

export const selectCheckSelfReferred = (state: RootState) =>
	state.referrals.onboarding.isSelfReferred

export const selectIsReferralCodeValid = createSelector(
	selectUnmintedBoostNft,
	(unmintedBoostNft) => unmintedBoostNft !== ReferralTiers.INVALID
)

export const selectBoostNft = (state: RootState) => state.referrals.holder.boostNft

export const selectIsBoostNftLoaded = (state: RootState): boolean => {
	const { status } = state.referrals.holder.fetchBoostNftStatus
	return status === FetchStatus.Success || status === FetchStatus.Error
}

export const selectReferralEpoch = createSelector(
	(state: RootState) => state.referrals.holder.referralEpoch,
	selectWallet,
	(referralStatsByEpoch, wallet) => {
		if (!wallet) return []
		return referralStatsByEpoch
	}
)

export const selectReferralNft = (state: RootState) => state.referrals.referrer.referralNft

export const selectReferralScore = (state: RootState) => state.referrals.referrer.referralScore

export const selectReferralCodes = createSelector(
	(state: RootState) => state.referrals.referrer.referralCodes,
	selectWallet,
	(referralStatsByCodes, wallet) => {
		if (!wallet) return []
		return referralStatsByCodes
	}
)

export const selectSubmittingReferralTx = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (
			app.transaction?.status === TransactionStatus.AwaitingExecution ||
			app.transaction?.status === TransactionStatus.Executed
		)
	}
)

export const selectIsMintingBoostNft = createSelector(
	selectSubmittingReferralTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return submitting && app.transaction?.type === 'mint_boost_nft'
	}
)

export const selectIsCreatingReferralCode = createSelector(
	selectSubmittingReferralTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return submitting && app.transaction?.type === 'register_referral_code'
	}
)

export const selectCumulativeStatsByCode = createSelector(selectReferralCodes, (referralCodes) => ({
	totalVolume: calculateTotal(referralCodes, 'referralVolume'),
	totalRewards: calculateTotal(referralCodes, 'earnedRewards'),
	totalTraders: calculateTotal(referralCodes, 'referredCount'),
}))
