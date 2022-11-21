export type PriceResponse = Record<string, { usd: number; usd_24h_change: number }>;

// map of currencies to coingecko ids
export enum CoinGeckoPriceIds {
	ETH = 'ethereum',
}
