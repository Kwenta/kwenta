import { formatBytes32String } from 'ethers/lib/utils.js';

import { V2_MARKETS_LIST } from './futures';

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
