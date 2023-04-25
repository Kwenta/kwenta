import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils.js';
import { gql } from 'graphql-request';

import { FuturesMarketAsset, FuturesMarketConfig, FuturesMarketKey } from 'sdk/types/futures';
import { weiFromWei } from 'utils/formatters/number';

export const KWENTA_TRACKING_CODE = formatBytes32String('KWENTA');

export const DEFAULT_NUMBER_OF_TRADES = 16;

export const FUTURES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-perps/api`;

export const FUTURES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-perps';

export const MAIN_ENDPOINT_MAINNET = `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/HLy7PdmPJuVGjjmPNz1vW5RCCRpqzRWony2fSn7UKpf9`;

export const MAIN_ENDPOINT_OP_MAINNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main';

export const MAIN_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-main';

export const SL_TP_MAX_SIZE = weiFromWei(ethers.constants.MaxInt256);

export const ORDERS_FETCH_SIZE = 500;

export const FUTURES_ENDPOINTS: Record<number, string> = {
	10: FUTURES_ENDPOINT_OP_MAINNET,
	420: FUTURES_ENDPOINT_OP_GOERLI,
};

export const MAIN_ENDPOINTS: Record<number, string> = {
	1: MAIN_ENDPOINT_MAINNET,
	10: MAIN_ENDPOINT_OP_MAINNET,
	420: MAIN_ENDPOINT_OP_GOERLI,
};

export const MARKETS: Record<FuturesMarketKey, FuturesMarketConfig> = {
	// perps v2
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
	[FuturesMarketKey.sBTCPERP]: {
		key: FuturesMarketKey.sBTCPERP,
		asset: FuturesMarketAsset.sBTC,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
			testnet: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
		},
	},
	[FuturesMarketKey.sLINKPERP]: {
		key: FuturesMarketKey.sLINKPERP,
		asset: FuturesMarketAsset.LINK,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
			testnet: '0x83be4ed61dd8a3518d198098ce37240c494710a7b9d85e35d9fceac21df08994',
		},
	},
	[FuturesMarketKey.sSOLPERP]: {
		key: FuturesMarketKey.sSOLPERP,
		asset: FuturesMarketAsset.SOL,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
			testnet: '0xfe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd',
		},
	},
	[FuturesMarketKey.sAVAXPERP]: {
		key: FuturesMarketKey.sAVAXPERP,
		asset: FuturesMarketAsset.AVAX,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
			testnet: '0xd7566a3ba7f7286ed54f4ae7e983f4420ae0b1e0f3892e11f9c4ab107bbad7b9',
		},
	},
	[FuturesMarketKey.sAAVEPERP]: {
		key: FuturesMarketKey.sAAVEPERP,
		asset: FuturesMarketAsset.AAVE,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
			testnet: '0xd6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5',
		},
	},
	[FuturesMarketKey.sUNIPERP]: {
		key: FuturesMarketKey.sUNIPERP,
		asset: FuturesMarketAsset.UNI,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
			testnet: '0x64ae1fc7ceacf2cd59bee541382ff3770d847e63c40eb6cf2413e7de5e93078a',
		},
	},
	[FuturesMarketKey.sMATICPERP]: {
		key: FuturesMarketKey.sMATICPERP,
		asset: FuturesMarketAsset.MATIC,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
			testnet: '0xd2c2c1f2bba8e0964f9589e060c2ee97f5e19057267ac3284caef3bd50bd2cb5',
		},
	},
	[FuturesMarketKey.sXAUPERP]: {
		key: FuturesMarketKey.sXAUPERP,
		asset: FuturesMarketAsset.XAU,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
			testnet: '0x30a19158f5a54c0adf8fb7560627343f22a1bc852b89d56be1accdc5dbf96d0e',
		},
	},
	[FuturesMarketKey.sXAGPERP]: {
		key: FuturesMarketKey.sXAGPERP,
		asset: FuturesMarketAsset.XAG,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e',
			testnet: '0x321ba4d608fa75ba76d6d73daa715abcbdeb9dba02257f05a1b59178b49f599b',
		},
	},
	[FuturesMarketKey.sEURPERP]: {
		key: FuturesMarketKey.sEURPERP,
		asset: FuturesMarketAsset.EUR,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
			testnet: '0xc1b12769f6633798d45adfd62bfc70114839232e2949b01fb3d3f927d2606154',
		},
	},
	[FuturesMarketKey.sAPEPERP]: {
		key: FuturesMarketKey.sAPEPERP,
		asset: FuturesMarketAsset.APE,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
			testnet: '0xcb1743d0e3e3eace7e84b8230dc082829813e3ab04e91b503c08e9a441c0ea8b',
		},
	},
	[FuturesMarketKey.sDYDXPERP]: {
		key: FuturesMarketKey.sDYDXPERP,
		asset: FuturesMarketAsset.DYDX,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b',
			testnet: '0x05a934cb3bbadef93b525978ab5bd3d5ce3b8fc6717b9ea182a688c5d8ee8e02',
		},
	},
	[FuturesMarketKey.sBNBPERP]: {
		key: FuturesMarketKey.sBNBPERP,
		asset: FuturesMarketAsset.BNB,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
			testnet: '0xecf553770d9b10965f8fb64771e93f5690a182edc32be4a3236e0caaa6e0581a',
		},
	},
	[FuturesMarketKey.sDOGEPERP]: {
		key: FuturesMarketKey.sDOGEPERP,
		asset: FuturesMarketAsset.DOGE,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
			testnet: '0x31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae',
		},
	},
	[FuturesMarketKey.sOPPERP]: {
		key: FuturesMarketKey.sOPPERP,
		asset: FuturesMarketAsset.OP,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
			testnet: '0x71334dcd37620ce3c33e3bafef04cc80dec083042e49b734315b36d1aad7991f',
		},
	},
	[FuturesMarketKey.sARBPERP]: {
		key: FuturesMarketKey.sARBPERP,
		asset: FuturesMarketAsset.ARB,
		supports: 'mainnet',
		version: 2,
		pythIds: {
			mainnet: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
			testnet: '0x37f40d2898159e8f2e52b93cb78f47cc3829a31e525ab975c49cc5c5d9176378',
		},
	},
	[FuturesMarketKey.sATOMPERP]: {
		key: FuturesMarketKey.sATOMPERP,
		asset: FuturesMarketAsset.ATOM,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
			testnet: '0x61226d39beea19d334f17c2febce27e12646d84675924ebb02b9cdaea68727e3',
		},
	},
	[FuturesMarketKey.sFTMPERP]: {
		key: FuturesMarketKey.sFTMPERP,
		asset: FuturesMarketAsset.FTM,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
			testnet: '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd',
		},
	},
	[FuturesMarketKey.sNEARPERP]: {
		key: FuturesMarketKey.sNEARPERP,
		asset: FuturesMarketAsset.NEAR,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
			testnet: '0x27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4',
		},
	},
	[FuturesMarketKey.sFLOWPERP]: {
		key: FuturesMarketKey.sFLOWPERP,
		asset: FuturesMarketAsset.FLOW,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x2fb245b9a84554a0f15aa123cbb5f64cd263b59e9a87d80148cbffab50c69f30',
			testnet: '0xaa67a6594d0e1578faa3bba80bec5b31e461b945e4fbab59eeab38ece09335fb',
		},
	},
	[FuturesMarketKey.sAXSPERP]: {
		key: FuturesMarketKey.sAXSPERP,
		asset: FuturesMarketAsset.AXS,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xb7e3904c08ddd9c0c10c6d207d390fd19e87eb6aab96304f571ed94caebdefa0',
			testnet: '0xb327d9cf0ecd793a175fa70ac8d2dc109d4462758e556962c4a87b02ec4f3f15',
		},
	},
	[FuturesMarketKey.sAUDPERP]: {
		key: FuturesMarketKey.sAUDPERP,
		asset: FuturesMarketAsset.AUD,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80',
			testnet: '0x2646ca1e1186fd2bb48b2ab3effa841d233b7e904b2caebb19c8030784a89c97',
		},
	},
	[FuturesMarketKey.sGBPPERP]: {
		key: FuturesMarketKey.sGBPPERP,
		asset: FuturesMarketAsset.GBP,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
			testnet: '0xbcbdc2755bd74a2065f9d3283c2b8acbd898e473bdb90a6764b3dbd467c56ecd',
		},
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

// subgraph fragments
export const ISOLATED_MARGIN_FRAGMENT = gql`
	query userFuturesMarginTransfers($walletAddress: String!) {
		futuresMarginTransfers(
			where: { account: $walletAddress }
			orderBy: timestamp
			orderDirection: desc
			first: 1000
		) {
			id
			timestamp
			account
			market
			size
			asset
			txHash
		}
	}
`;

export const SMART_MARGIN_FRAGMENT = gql`
	query userSmartMarginTransfers($walletAddress: String!) {
		smartMarginAccountTransfers(
			where: { abstractAccount: $walletAddress }
			orderBy: timestamp
			orderDirection: desc
			first: 1000
		) {
			id
			timestamp
			account
			size
			txHash
		}
	}
`;
