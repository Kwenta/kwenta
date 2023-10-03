type StakingCard = {
	key: string
	title: string
	value: string
	onClick?: () => void
	hidden?: boolean
}

export type StakingCards = {
	key: string
	category: string
	card: StakingCard[]
	onClick?: () => void
	icon?: React.ReactNode
	flex?: number
	hidden?: boolean
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

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
	Delegate = 'delegate',
}
