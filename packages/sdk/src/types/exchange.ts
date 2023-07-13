import Wei from '@synthetixio/wei'
import { SynthSymbol } from '../data'

export type PriceResponse = Record<string, { usd: number; usd_24h_change: number }>

export type Rates = Record<string, Wei>

export type SynthExchange = {
	id: string
	fromAmount: string
	fromAmountInUSD: string
	fromSynth: {
		name: string
		symbol: SynthSymbol
		id: string
	}
	toSynth: {
		name: string
		symbol: SynthSymbol
		id: string
	}
	toAmount: string
	toAmountInUSD: string
	feesInUSD: string
	toAddress: string
	timestamp: string
	gasPrice: string
}
