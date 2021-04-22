export type PriceResponse = Record<string, { usd: number }>;

// map of currencies to coingecko ids
export enum CoinGeckoPriceIds {
	ETH = 'ethereum',
}
