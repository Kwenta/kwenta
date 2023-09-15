export type ReferralNftDetail = {
	code: string
	tier: number
}

export interface BoostReferrer {
	id: string
	account: string
}

export interface BoostHolder {
	id: string
	code: string
	lastMintedAt: string
}

export type ReferralCumulativeStats = {
	code: string
	referralVolume: string
	referredCount: string
	earnedRewards: string
}
