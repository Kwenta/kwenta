export type ReferralRewardsInfo = {
	earnedRewards: string
	referralVolume: string
	referredCount: string
}

export type ReferralsRewardsPerCode = ReferralRewardsInfo & {
	code: string
}

export type ReferralsRewardsPerEpoch = ReferralRewardsInfo & {
	epoch: string
}

export enum ReferralsTab {
	Traders = 'traders',
	Affiliates = 'affiliates',
}

export type ReferralsMetrics = {
	key: string
	label: string
	value: string
	icon?: JSX.Element
	active?: boolean
	buttonLabel?: string
	onClick?: () => void
	loading?: boolean
}

export enum ReferralTiers {
	INVALID = -1,
	BRONZE = 0,
	SILVER = 1,
	GOLD = 2,
}

export type ReferralTierDetails = {
	title: string
	tier: ReferralTiers
	displayTier: number
	icon: JSX.Element
	boost: number
	nftPreview: JSX.Element
	threshold: number
	animationUrl: string
}
