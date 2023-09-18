type StakingCard = {
	key: string
	title: string
	value: string
	onClick?: () => void
}

export type StakingCards = {
	category: string
	card: StakingCard[]
	onClick?: () => void
	icon?: React.ReactNode
	flex?: number
}

type RewardsCard = {
	label: string
	value: string
	labelIcon?: React.ReactNode
	valueIcon?: React.ReactNode
}

export type EpochValue = {
	period: number
	start: number
	end: number
	label: string
}

export type RewardsInfo = {
	key: string
	title: string
	copy: string
	labels: RewardsCard[]
	info: RewardsCard[]
	disabled?: boolean
}
