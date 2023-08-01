import { wei } from '@synthetixio/wei'
import { ethers } from 'ethers'
import { gql } from 'graphql-request'

import {
	FuturesMarketAsset,
	FuturesMarketConfig,
	FuturesMarketKey,
	SmartMarginOrderType,
	FuturesOrderType,
} from '../types/futures'
import { weiFromWei } from '../utils/number'

export const KWENTA_TRACKING_CODE = ethers.utils.formatBytes32String('KWENTA')

// Defaults

export const DEFAULT_NUMBER_OF_TRADES = 32

export const DEFAULT_PRICE_IMPACT_DELTA_PERCENT = {
	MARKET: '1',
	STOP: '4',
	LIMIT: '4',
	STOP_LOSS: '5',
	TAKE_PROFIT: '5',
}

export const FUTURES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-perps/version/0.0.9/api`

export const FUTURES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-perps'

export const MAIN_ENDPOINT_MAINNET = `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/HLy7PdmPJuVGjjmPNz1vW5RCCRpqzRWony2fSn7UKpf9`

export const MAIN_ENDPOINT_OP_MAINNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main'

export const MAIN_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-main'

export const PERPS_V3_SUBGRAPH_URLS: Record<number, string> = {
	// TODO: Update perps v3 subgraph urls
	420: 'https://api.thegraph.com/subgraphs/name/rickk137/v3-perps-opt-goerli',
}

export const KWENTA_PYTH_SERVER = 'https://price.kwenta.io'

export const PUBLIC_PYTH_SERVER = 'https://xc-mainnet.pyth.network'

export const SL_TP_MAX_SIZE = weiFromWei(ethers.constants.MaxInt256)

export const ORDERS_FETCH_SIZE = 500

export const ISOLATED_MARGIN_ORDER_TYPES: FuturesOrderType[] = ['market']
export const CROSS_MARGIN_ORDER_TYPES: SmartMarginOrderType[] = ['market', 'limit', 'stop_market']
export const ORDER_KEEPER_ETH_DEPOSIT = wei(0.01)
export const DEFAULT_DELAYED_LEVERAGE_CAP = wei(100)
export const MAX_POSITION_BUFFER = 0.01
export const MIN_MARGIN_AMOUNT = wei(50)
export const APP_MAX_LEVERAGE = wei(50)

export const FUTURES_ENDPOINTS: Record<number, string> = {
	10: FUTURES_ENDPOINT_OP_MAINNET,
	420: FUTURES_ENDPOINT_OP_GOERLI,
}

export const MAIN_ENDPOINTS: Record<number, string> = {
	1: MAIN_ENDPOINT_MAINNET,
	10: MAIN_ENDPOINT_OP_MAINNET,
	420: MAIN_ENDPOINT_OP_GOERLI,
}

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

	//

	[FuturesMarketKey.sAPTPERP]: {
		key: FuturesMarketKey.sAPTPERP,
		asset: FuturesMarketAsset.APT,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
			testnet: '0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e',
		},
	},
	[FuturesMarketKey.sLDOPERP]: {
		key: FuturesMarketKey.sLDOPERP,
		asset: FuturesMarketAsset.LDO,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad',
			testnet: '0x69b9ca2e7159fe570844c22bac849c490e0ddfd0349626c19fd7d65509e192a3',
		},
	},
	[FuturesMarketKey.sADAPERP]: {
		key: FuturesMarketKey.sADAPERP,
		asset: FuturesMarketAsset.ADA,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
			testnet: '0x73dc009953c83c944690037ea477df627657f45c14f16ad3a61089c5a3f9f4f2',
		},
	},
	[FuturesMarketKey.sGMXPERP]: {
		key: FuturesMarketKey.sGMXPERP,
		asset: FuturesMarketAsset.GMX,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xb962539d0fcb272a494d65ea56f94851c2bcf8823935da05bd628916e2e9edbf',
			testnet: '0x4b57c2471f6ab9250d26b7e0ff8807bfd620a609503f52b0b67645f69eb2d5c5',
		},
	},
	[FuturesMarketKey.sFILPERP]: {
		key: FuturesMarketKey.sFILPERP,
		asset: FuturesMarketAsset.FIL,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e',
			testnet: '0xb5622d32f36dc820af288aab779133ef1205d3123bbe256603849b820de48b87',
		},
	},
	[FuturesMarketKey.sLTCPERP]: {
		key: FuturesMarketKey.sLTCPERP,
		asset: FuturesMarketAsset.LTC,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
			testnet: '0x997e0bf451cb36b4aea096e6b5c254d700922211dd933d9d17c467f0d6f34321',
		},
	},
	[FuturesMarketKey.sBCHPERP]: {
		key: FuturesMarketKey.sBCHPERP,
		asset: FuturesMarketAsset.BCH,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3',
			testnet: '0x30029479598797290e3638a1712c29bde2367d0eca794f778b25b5a472f192de',
		},
	},
	[FuturesMarketKey.sSHIBPERP]: {
		key: FuturesMarketKey.sSHIBPERP,
		asset: FuturesMarketAsset.SHIB,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a',
			testnet: '0x672fbb7d9ec665cfbe8c2ffa643ba321a047b7a72d7b6d7c3d8fb120fc40954b',
		},
	},
	[FuturesMarketKey.sCRVPERP]: {
		key: FuturesMarketKey.sCRVPERP,
		asset: FuturesMarketAsset.CRV,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8',
			testnet: '0x94bce4aee88fdfa5b58d81090bd6b3784717fa6df85419d9f04433bb3d615d5c',
		},
	},
	[FuturesMarketKey.sSUIPERP]: {
		key: FuturesMarketKey.sSUIPERP,
		asset: FuturesMarketAsset.SUI,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
			testnet: '0x50c67b3fd225db8912a424dd4baed60ffdde625ed2feaaf283724f9608fea266',
		},
	},
	[FuturesMarketKey.sPEPEPERP]: {
		key: FuturesMarketKey.sPEPEPERP,
		asset: FuturesMarketAsset.PEPE,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4',
			testnet: '0xed82efbfade01083ffa8f64664c86af39282c9f084877066ae72b635e77718f0',
		},
	},
	[FuturesMarketKey.sBLURPERP]: {
		key: FuturesMarketKey.sBLURPERP,
		asset: FuturesMarketAsset.BLUR,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x856aac602516addee497edf6f50d39e8c95ae5fb0da1ed434a8c2ab9c3e877e9',
			testnet: '0xbe2dbc97659e92bf07462aeda414195246515e6b17abd6997f0ab2297cb03e1d',
		},
	},
	[FuturesMarketKey.sXRPPERP]: {
		key: FuturesMarketKey.sXRPPERP,
		asset: FuturesMarketAsset.XRP,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
			testnet: '0xbfaf7739cb6fe3e1c57a0ac08e1d931e9e6062d476fa57804e165ab572b5b621',
		},
	},
	[FuturesMarketKey.sDOTPERP]: {
		key: FuturesMarketKey.sDOTPERP,
		asset: FuturesMarketAsset.DOT,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
			testnet: '0x36032e522b810babd8e3148e9f0d588af9e95e93b97ffb58566b837fdbd31f7f',
		},
	},
	[FuturesMarketKey.sTRXPERP]: {
		key: FuturesMarketKey.sTRXPERP,
		asset: FuturesMarketAsset.TRX,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b',
			testnet: '0x013317758a5b499650d72edcd7ba12bb5cc54ce9434196b607fa5e01e0f7797b',
		},
	},
	[FuturesMarketKey.sFLOKIPERP]: {
		key: FuturesMarketKey.sFLOKIPERP,
		asset: FuturesMarketAsset.FLOKI,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293',
			testnet: '0x57596fe1a697014b962ac9e693dee99c4bb01d6c5eca271a1a26ad475a92cdbd',
		},
	},
	[FuturesMarketKey.sINJPERP]: {
		key: FuturesMarketKey.sINJPERP,
		asset: FuturesMarketAsset.INJ,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
			testnet: '0x2d9315a88f3019f8efa88dfe9c0f0843712da0bac814461e27733f6b83eb51b3',
		},
	},
	[FuturesMarketKey.sSTETHPERP]: {
		key: FuturesMarketKey.sSTETHPERP,
		asset: FuturesMarketAsset.STETH,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5',
			testnet: '0xb7abd25a76ddaffdf847224f03198ccb92723f90b2429cf33f0eecb96e352a86',
		},
	},
	[FuturesMarketKey.sETHBTCPERP]: {
		key: FuturesMarketKey.sETHBTCPERP,
		asset: FuturesMarketAsset.ETHBTC,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0xc96458d393fe9deb7a7d63a0ac41e2898a67a7750dbd166673279e06c868df0a',
			testnet: '0x754a0a0800247d77751e35efb91638c828046103be3bb3d26989e65bf4010859',
		},
	},
	[FuturesMarketKey.sXMRPERP]: {
		key: FuturesMarketKey.sXMRPERP,
		asset: FuturesMarketAsset.XMR,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x46b8cc9347f04391764a0361e0b17c3ba394b001e7c304f7650f6376e37c321d',
			testnet: '0xa7e2e2f7d47b17d18e6d49c427f21fb30c0a85e621a8502c3c4e486f3ab543c8',
		},
	},
	[FuturesMarketKey.sMAVPERP]: {
		key: FuturesMarketKey.sMAVPERP,
		asset: FuturesMarketAsset.MAV,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x5b131ede5d017511cf5280b9ebf20708af299266a033752b64180c4201363b11',
			testnet: '0x01a33b54c2911e1f58fdc02bc03e3778508bb9a84571afca33e2757791eb1269',
		},
	},
	[FuturesMarketKey.sETCPERP]: {
		key: FuturesMarketKey.sETCPERP,
		asset: FuturesMarketAsset.ETC,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x7f5cc8d963fc5b3d2ae41fe5685ada89fd4f14b435f8050f28c7fd409f40c2d8',
			testnet: '0xd77bfe9814f5a4718e1420881093efa8c0fe1a783472899f27ad4c7a58ef4d27',
		},
	},
	[FuturesMarketKey.sCOMPPERP]: {
		key: FuturesMarketKey.sCOMPPERP,
		asset: FuturesMarketAsset.COMP,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478',
			testnet: '0x4e149083ba3766e716b77c1a6f7744709a075bed2ac08dc485543616454a6404',
		},
	},
	[FuturesMarketKey.sYFIPERP]: {
		key: FuturesMarketKey.sYFIPERP,
		asset: FuturesMarketAsset.YFI,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x425f4b198ab2504936886c1e93511bb6720fbcf2045a4f3c0723bb213846022f',
			testnet: '0xc9c8430ee6c26e218abe9f1c9cb88a664f7096d4934d8dfda17bc5d79e918848',
		},
	},
	[FuturesMarketKey.sMKRPERP]: {
		key: FuturesMarketKey.sMKRPERP,
		asset: FuturesMarketAsset.MKR,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378',
			testnet: '0xc4d994230a6db7909135e4673287fb672f45ea92fb40b1bc9adf101ecf877ab7',
		},
	},
	[FuturesMarketKey.sRPLPERP]: {
		key: FuturesMarketKey.sRPLPERP,
		asset: FuturesMarketAsset.RPL,
		supports: 'both',
		version: 2,
		pythIds: {
			mainnet: '0x24f94ac0fd8638e3fc41aab2e4df933e63f763351b640bf336a6ec70651c4503',
			testnet: '0x9c48c155a80410aaa3699f6257d2255f6c95d0879766db1a187a249096ed2e94',
		},
	},
}

export const MARKET_ASSETS_BY_PYTH_ID = Object.values(MARKETS)
	.filter((m) => !!m.pythIds)
	.reduce((acc, m) => {
		acc[m.pythIds!.mainnet] = m.asset
		acc[m.pythIds!.testnet] = m.asset
		return acc
	}, {} as Record<string, FuturesMarketAsset>)

export const MARKETS_LIST = Object.values(MARKETS).filter((m) => !m.disabled)

export const V2_MARKETS = Object.entries(MARKETS).reduce((acc, [key, m]) => {
	if (m.version === 2) acc[key as FuturesMarketKey] = m
	return acc
}, {} as Record<FuturesMarketKey, FuturesMarketConfig>)

export const V2_MARKETS_LIST = Object.values(V2_MARKETS).filter((m) => !m.disabled)

export const MAINNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'mainnet' || m.supports === 'both'
)

export const TESTNET_MARKETS = MARKETS_LIST.filter(
	(m) => m.supports === 'testnet' || m.supports === 'both'
)

export const BPS_CONVERSION = 10000

export const DEFAULT_DESIRED_TIMEDELTA = 0

export const AGGREGATE_ASSET_KEY = '0x'

export const LOW_FEE_TIER = 500

export const AMOUNT_OUT_MIN = 1

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
`

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
`
