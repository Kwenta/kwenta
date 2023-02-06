import { formatBytes32String } from 'ethers/lib/utils.js';

import { V2_MARKETS_LIST } from './futures';

export const MAIN_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-latest-rates/api`;

export const MAIN_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-latest-rates';

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
export const ADDITIONAL_SYNTHS = [
	'SNX',
	'XAU',
	'XAG',
	'DYDX',
	'APE',
	'BNB',
	'DOGE',
	'DebtRatio',
	'XMR',
	'OP',
].map(formatBytes32String);

export const PYTH_IDS = {
	mainnet: V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds!.mainnet) as string[],
	testnet: V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds!.testnet) as string[],
};

// Allow to be set from config so users can customise
export const PRICE_UPDATE_THROTTLE = 500;
