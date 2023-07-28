export const RATES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-latest-rates/api`

export const RATES_ENDPOINT_OP_GOERLI = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-goerli-latest-rates/api`

export const RATES_ENDPOINT_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/goerli-main'

export const RATES_ENDPOINTS: Record<number, string> = {
	5: RATES_ENDPOINT_GOERLI,
	10: RATES_ENDPOINT_OP_MAINNET,
	420: RATES_ENDPOINT_OP_GOERLI,
}

export const getRatesEndpoint = (networkId: number): string => {
	return RATES_ENDPOINTS[networkId] || RATES_ENDPOINTS[10]
}
