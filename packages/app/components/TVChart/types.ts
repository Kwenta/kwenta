import Wei from '@synthetixio/wei'

export type ChartPosition = {
	size: Wei
	price: Wei
	liqPrice?: Wei
}

export type ChartBar = {
	high: number
	low: number
	open: number
	close: number
	time: number
}
