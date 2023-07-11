import { SynthSymbol } from '@kwenta/sdk/data'
import Wei from '@synthetixio/wei'

export type ExchangeTokens = {
	synth: SynthSymbol
	description: string
	balance: Wei
	usdBalance: Wei
	price: Wei
	priceChange: Wei
}[]
