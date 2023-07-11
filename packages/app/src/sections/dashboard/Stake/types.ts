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
