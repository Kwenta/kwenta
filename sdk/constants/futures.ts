import { FuturesMarketAsset, FuturesMarketConfig, FuturesMarketKey } from 'sdk/types/futures';

export const FUTURES_ENDPOINT_OP_MAINNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-futures';

export const FUTURES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-futures';

export const FUTURES_ENDPOINTS: Record<number, string> = {
	10: FUTURES_ENDPOINT_OP_MAINNET,
	420: FUTURES_ENDPOINT_OP_GOERLI,
};

export const MARKETS: Record<FuturesMarketKey, FuturesMarketConfig> = {
	[FuturesMarketKey.pBTC]: {
		key: FuturesMarketKey.pBTC,
		asset: FuturesMarketAsset.sBTC,
		supports: 'mainnet',
	},
	[FuturesMarketKey.pETH]: {
		key: FuturesMarketKey.pETH,
		asset: FuturesMarketAsset.sETH,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sBTC]: {
		key: FuturesMarketKey.sBTC,
		asset: FuturesMarketAsset.sBTC,
		supports: 'none',
	},
	[FuturesMarketKey.sETH]: {
		key: FuturesMarketKey.sETH,
		asset: FuturesMarketAsset.sETH,
		supports: 'none',
	},
	[FuturesMarketKey.sLINK]: {
		key: FuturesMarketKey.sLINK,
		asset: FuturesMarketAsset.sLINK,
		supports: 'none',
	},
	[FuturesMarketKey.sSOL]: {
		key: FuturesMarketKey.sSOL,
		asset: FuturesMarketAsset.SOL,
		supports: 'none',
	},
	[FuturesMarketKey.sAVAX]: {
		key: FuturesMarketKey.sAVAX,
		asset: FuturesMarketAsset.AVAX,
		supports: 'none',
	},
	[FuturesMarketKey.sAAVE]: {
		key: FuturesMarketKey.sAAVE,
		asset: FuturesMarketAsset.AAVE,
		supports: 'none',
	},
	[FuturesMarketKey.sUNI]: {
		key: FuturesMarketKey.sUNI,
		asset: FuturesMarketAsset.UNI,
		supports: 'none',
	},
	[FuturesMarketKey.sMATIC]: {
		key: FuturesMarketKey.sMATIC,
		asset: FuturesMarketAsset.MATIC,
		supports: 'none',
	},
	[FuturesMarketKey.sXAU]: {
		key: FuturesMarketKey.sXAU,
		asset: FuturesMarketAsset.XAU,
		supports: 'none',
	},
	[FuturesMarketKey.sXAG]: {
		key: FuturesMarketKey.sXAG,
		asset: FuturesMarketAsset.XAG,
		supports: 'none',
	},
	[FuturesMarketKey.sEUR]: {
		key: FuturesMarketKey.sEUR,
		asset: FuturesMarketAsset.EUR,
		supports: 'none',
	},
	[FuturesMarketKey.sAPE]: {
		key: FuturesMarketKey.sAPE,
		asset: FuturesMarketAsset.APE,
		supports: 'none',
	},
	[FuturesMarketKey.sDYDX]: {
		key: FuturesMarketKey.sDYDX,
		asset: FuturesMarketAsset.DYDX,
		supports: 'none',
	},
	[FuturesMarketKey.sBNB]: {
		key: FuturesMarketKey.sBNB,
		asset: FuturesMarketAsset.BNB,
		supports: 'none',
	},
	[FuturesMarketKey.sDOGE]: {
		key: FuturesMarketKey.sDOGE,
		asset: FuturesMarketAsset.DOGE,
		supports: 'none',
	},
	[FuturesMarketKey.sDebtRatio]: {
		key: FuturesMarketKey.sDebtRatio,
		asset: FuturesMarketAsset.DebtRatio,
		supports: 'none',
	},
	[FuturesMarketKey.sXMR]: {
		key: FuturesMarketKey.sXMR,
		asset: FuturesMarketAsset.XMR,
		supports: 'none',
	},
	[FuturesMarketKey.sOP]: {
		key: FuturesMarketKey.sOP,
		asset: FuturesMarketAsset.OP,
		supports: 'none',
	},
};

export const MARKETS_LIST = Object.values(MARKETS).filter((m) => !m.disabled);

export const MAINNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'mainnet' || m.supports === 'both'
);

export const TESTNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'testnet' || m.supports === 'both'
);
