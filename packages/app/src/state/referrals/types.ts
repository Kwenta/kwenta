import { TransactionStatus } from '@kwenta/sdk/types'

import {
	ReferralTiers,
	ReferralsRewardsPerCode,
	ReferralsRewardsPerEpoch,
} from 'sections/referrals/types'
import { QueryStatus } from 'state/types'

type OnboardingState = {
	mintedBoostNft: boolean
	startOnboarding: boolean
	isSelfReferred: boolean
	unmintedBoostNft: ReferralTiers
	checkReferrerStatus: QueryStatus
}

type HolderState = {
	boostNft: ReferralTiers
	referralEpoch: ReferralsRewardsPerEpoch[]
	fetchBoostNftStatus: QueryStatus
	fetchReferralEpochStatus: QueryStatus
}

type ReferrerState = {
	referralNft: ReferralTiers
	referralScore: number
	referralCodes: ReferralsRewardsPerCode[]
	fetchReferralNftStatus: QueryStatus
	fetchReferralScoreStatus: QueryStatus
	fetchReferralCodeStatus: QueryStatus
}

export type ReferralsState = {
	onboarding: OnboardingState
	holder: HolderState
	referrer: ReferrerState
}

export type ReferralTransactionType = 'mint_boost_nft' | 'register_referral_code'

export type ReferralTransaction = {
	type: ReferralTransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}
