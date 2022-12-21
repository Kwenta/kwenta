import { FuturesMarketAsset, FuturesMarketConfig, FuturesMarketKey } from 'sdk/types/futures';

export const FUTURES_ENDPOINT_OP_MAINNET =
	'https://api.thegraph.com/subgraphs/name/tburm/optimism-futures';

export const FUTURES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/tburm/optimism-goerli-futures';

export const FUTURES_ENDPOINTS: Record<number, string> = {
	10: FUTURES_ENDPOINT_OP_MAINNET,
	420: FUTURES_ENDPOINT_OP_GOERLI,
};

export const MARKETS: Record<FuturesMarketKey, FuturesMarketConfig> = {
	// perps v2
	[FuturesMarketKey.sBTCPERP]: {
		key: FuturesMarketKey.sBTCPERP,
		asset: FuturesMarketAsset.sBTC,
		supports: 'testnet',
		version: 2,
		pythIds: {
			mainnet: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
			testnet: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
		},
	},
	[FuturesMarketKey.sETHPERP]: {
		key: FuturesMarketKey.sETHPERP,
		asset: FuturesMarketAsset.sETH,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
			testnet: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
		},
	},

	// perps v1
	[FuturesMarketKey.sBTC]: {
		key: FuturesMarketKey.sBTC,
		asset: FuturesMarketAsset.sBTC,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
			testnet: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
		},
	},
	[FuturesMarketKey.sETH]: {
		key: FuturesMarketKey.sETH,
		asset: FuturesMarketAsset.sETH,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
			testnet: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
		},
	},
	[FuturesMarketKey.sLINK]: {
		key: FuturesMarketKey.sLINK,
		asset: FuturesMarketAsset.sLINK,
		supports: 'mainnet',
		version: 1,
	},
	[FuturesMarketKey.sSOL]: {
		key: FuturesMarketKey.sSOL,
		asset: FuturesMarketAsset.SOL,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
			testnet: '0xfe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd',
		},
	},
	[FuturesMarketKey.sAVAX]: {
		key: FuturesMarketKey.sAVAX,
		asset: FuturesMarketAsset.AVAX,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
			testnet: '0xd7566a3ba7f7286ed54f4ae7e983f4420ae0b1e0f3892e11f9c4ab107bbad7b9',
		},
	},
	[FuturesMarketKey.sAAVE]: {
		key: FuturesMarketKey.sAAVE,
		asset: FuturesMarketAsset.AAVE,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
			testnet: '0xd6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5',
		},
	},
	[FuturesMarketKey.sUNI]: {
		key: FuturesMarketKey.sUNI,
		asset: FuturesMarketAsset.UNI,
		supports: 'mainnet',
		version: 1,
	},
	[FuturesMarketKey.sMATIC]: {
		key: FuturesMarketKey.sMATIC,
		asset: FuturesMarketAsset.MATIC,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
			testnet: '0xd2c2c1f2bba8e0964f9589e060c2ee97f5e19057267ac3284caef3bd50bd2cb5',
		},
	},
	[FuturesMarketKey.sXAU]: {
		key: FuturesMarketKey.sXAU,
		asset: FuturesMarketAsset.XAU,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
			testnet: '0x30a19158f5a54c0adf8fb7560627343f22a1bc852b89d56be1accdc5dbf96d0e',
		},
	},
	[FuturesMarketKey.sXAG]: {
		key: FuturesMarketKey.sXAG,
		asset: FuturesMarketAsset.XAG,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e',
			testnet: '0x321ba4d608fa75ba76d6d73daa715abcbdeb9dba02257f05a1b59178b49f599b',
		},
	},
	[FuturesMarketKey.sEUR]: {
		key: FuturesMarketKey.sEUR,
		asset: FuturesMarketAsset.EUR,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
			testnet: '0xc1b12769f6633798d45adfd62bfc70114839232e2949b01fb3d3f927d2606154',
		},
	},
	[FuturesMarketKey.sAPE]: {
		key: FuturesMarketKey.sAPE,
		asset: FuturesMarketAsset.APE,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
			testnet: '0xcb1743d0e3e3eace7e84b8230dc082829813e3ab04e91b503c08e9a441c0ea8b',
		},
	},
	[FuturesMarketKey.sDYDX]: {
		key: FuturesMarketKey.sDYDX,
		asset: FuturesMarketAsset.DYDX,
		supports: 'mainnet',
		version: 1,
	},
	[FuturesMarketKey.sBNB]: {
		key: FuturesMarketKey.sBNB,
		asset: FuturesMarketAsset.BNB,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
			testnet: '0xecf553770d9b10965f8fb64771e93f5690a182edc32be4a3236e0caaa6e0581a',
		},
	},
	[FuturesMarketKey.sDOGE]: {
		key: FuturesMarketKey.sDOGE,
		asset: FuturesMarketAsset.DOGE,
		supports: 'mainnet',
		version: 1,
		pythIds: {
			mainnet: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
			testnet: '0x31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae',
		},
	},
	[FuturesMarketKey.sDebtRatio]: {
		key: FuturesMarketKey.sDebtRatio,
		asset: FuturesMarketAsset.DebtRatio,
		supports: 'mainnet',
		version: 1,
	},
	[FuturesMarketKey.sXMR]: {
		key: FuturesMarketKey.sXMR,
		asset: FuturesMarketAsset.XMR,
		supports: 'mainnet',
		version: 1,
	},
	[FuturesMarketKey.sOP]: {
		key: FuturesMarketKey.sOP,
		asset: FuturesMarketAsset.OP,
		supports: 'mainnet',
		version: 1,
	},
};

export const MARKET_ASSETS_BY_PYTH_ID = Object.values(MARKETS)
	.filter((m) => !!m.pythIds)
	.reduce((acc, m) => {
		acc[m.pythIds!.mainnet] = m.asset;
		acc[m.pythIds!.testnet] = m.asset;
		return acc;
	}, {} as Record<string, FuturesMarketAsset>);

export const MARKETS_LIST = Object.values(MARKETS).filter((m) => !m.disabled);

export const V2_MARKETS = Object.entries(MARKETS).reduce((acc, [key, m]) => {
	if (m.version === 2) acc[key as FuturesMarketKey] = m;
	return acc;
}, {} as Record<FuturesMarketKey, FuturesMarketConfig>);

export const V2_MARKETS_LIST = Object.values(V2_MARKETS).filter((m) => !m.disabled);

export const MAINNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'mainnet' || m.supports === 'both'
);

export const TESTNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'testnet' || m.supports === 'both'
);

export const BPS_CONVERSION = 10000;

export const DEFAULT_DESIRED_TIMEDELTA = 0;

export const AGGREGATE_ASSET_KEY = '0x';
