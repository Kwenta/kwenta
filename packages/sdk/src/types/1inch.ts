type Token = {
	symbol: string
	name: string
	address: string
	decimals: number
	logoURI: string
	tags: string[]
}

export type OneInchQuoteResponse = {
	toAmount: string
	fromToken: Token
	toToken: Token
}

export type OneInchSwapResponse = OneInchQuoteResponse & {
	tx: {
		from: string
		to: string
		data: string
		value: string
		gasPrice: string
		gas: number
	}
}

export type OneInchApproveSpenderResponse = {
	address: string
}

export type OneInchTokenListResponse = {
	tokens: Record<string, Token>
}
