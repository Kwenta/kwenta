import { chain } from 'containers/Connector/config';

export const RATES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-latest-rates/api`;

export const RATES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-latest-rates';

export const RATES_ENDPOINT_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/goerli-main';

export const DAY_PERIOD = 24 * 3600;

export const CG_BASE_API_URL = 'https://api.coingecko.com/api/v3';

export const COMMODITIES_BASE_API_URL =
	'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument';

export const FOREX_BASE_API_URL = 'https://api.exchangerate.host/latest';

export const DEFAULT_PYTH_TV_ENDPOINT = 'https://pyth-api.vintage-orange-muffin.com/v2/history';

export const RATES_ENDPOINTS = {
	[chain.goerli.id]: RATES_ENDPOINT_GOERLI,
	[chain.optimism.id]: RATES_ENDPOINT_OP_MAINNET,
	[chain.optimismGoerli.id]: RATES_ENDPOINT_OP_GOERLI,
};
