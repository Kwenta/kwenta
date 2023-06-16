import Wei from '@synthetixio/wei';
export type PriceResponse = Record<string, {
    usd: number;
    usd_24h_change: number;
}>;
export type Rates = Record<string, Wei>;
