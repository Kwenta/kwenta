import Wei from '@synthetixio/wei'

export type Candle = {
	id?: string
	synth?: string
	open: number
	high: number
	low: number
	average?: number
	close: number
	timestamp: number
}

export type Rates = Record<string, Wei>

export type PythResponse = {
	c: number[]
	h: number[]
	l: number[]
	o: number[]
	t: number[]
	v: number[]
	s: string
}

export type AssetTypes = Record<string, string[]>
