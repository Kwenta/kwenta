"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMART_MARGIN_FRAGMENT = exports.ISOLATED_MARGIN_FRAGMENT = exports.AGGREGATE_ASSET_KEY = exports.DEFAULT_DESIRED_TIMEDELTA = exports.BPS_CONVERSION = exports.TESTNET_MARKETS = exports.MAINNET_MARKETS = exports.V2_MARKETS_LIST = exports.V2_MARKETS = exports.MARKETS_LIST = exports.MARKET_ASSETS_BY_PYTH_ID = exports.MARKETS = exports.MAIN_ENDPOINTS = exports.FUTURES_ENDPOINTS = exports.APP_MAX_LEVERAGE = exports.MIN_MARGIN_AMOUNT = exports.MAX_POSITION_BUFFER = exports.DEFAULT_DELAYED_LEVERAGE_CAP = exports.ORDER_KEEPER_ETH_DEPOSIT = exports.CROSS_MARGIN_ORDER_TYPES = exports.ISOLATED_MARGIN_ORDER_TYPES = exports.ORDERS_FETCH_SIZE = exports.SL_TP_MAX_SIZE = exports.PUBLIC_PYTH_SERVER = exports.KWENTA_PYTH_SERVER = exports.MAIN_ENDPOINT_OP_GOERLI = exports.MAIN_ENDPOINT_OP_MAINNET = exports.MAIN_ENDPOINT_MAINNET = exports.FUTURES_ENDPOINT_OP_GOERLI = exports.FUTURES_ENDPOINT_OP_MAINNET = exports.DEFAULT_PRICE_IMPACT_DELTA_PERCENT = exports.DEFAULT_NUMBER_OF_TRADES = exports.KWENTA_TRACKING_CODE = void 0;
const wei_1 = require("@synthetixio/wei");
const ethers_1 = require("ethers");
const graphql_request_1 = require("graphql-request");
const futures_1 = require("../types/futures");
const number_1 = require("../utils/number");
exports.KWENTA_TRACKING_CODE = ethers_1.ethers.utils.formatBytes32String('KWENTA');
// Defaults
exports.DEFAULT_NUMBER_OF_TRADES = 32;
exports.DEFAULT_PRICE_IMPACT_DELTA_PERCENT = {
    MARKET: '1',
    STOP: '4',
    LIMIT: '4',
    STOP_LOSS: '5',
    TAKE_PROFIT: '5',
};
exports.FUTURES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-perps/version/0.0.9/api`;
exports.FUTURES_ENDPOINT_OP_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-perps';
exports.MAIN_ENDPOINT_MAINNET = `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/HLy7PdmPJuVGjjmPNz1vW5RCCRpqzRWony2fSn7UKpf9`;
exports.MAIN_ENDPOINT_OP_MAINNET = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main';
exports.MAIN_ENDPOINT_OP_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-main';
exports.KWENTA_PYTH_SERVER = 'https://price.kwenta.io';
exports.PUBLIC_PYTH_SERVER = 'https://xc-mainnet.pyth.network';
exports.SL_TP_MAX_SIZE = (0, number_1.weiFromWei)(ethers_1.ethers.constants.MaxInt256);
exports.ORDERS_FETCH_SIZE = 500;
exports.ISOLATED_MARGIN_ORDER_TYPES = ['market'];
exports.CROSS_MARGIN_ORDER_TYPES = ['market', 'limit', 'stop_market'];
exports.ORDER_KEEPER_ETH_DEPOSIT = (0, wei_1.wei)(0.01);
exports.DEFAULT_DELAYED_LEVERAGE_CAP = (0, wei_1.wei)(100);
exports.MAX_POSITION_BUFFER = 0.01;
exports.MIN_MARGIN_AMOUNT = (0, wei_1.wei)(50);
exports.APP_MAX_LEVERAGE = (0, wei_1.wei)(50);
exports.FUTURES_ENDPOINTS = {
    10: exports.FUTURES_ENDPOINT_OP_MAINNET,
    420: exports.FUTURES_ENDPOINT_OP_GOERLI,
};
exports.MAIN_ENDPOINTS = {
    1: exports.MAIN_ENDPOINT_MAINNET,
    10: exports.MAIN_ENDPOINT_OP_MAINNET,
    420: exports.MAIN_ENDPOINT_OP_GOERLI,
};
exports.MARKETS = {
    // perps v2
    [futures_1.FuturesMarketKey.sETHPERP]: {
        key: futures_1.FuturesMarketKey.sETHPERP,
        asset: futures_1.FuturesMarketAsset.sETH,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
            testnet: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
        },
    },
    [futures_1.FuturesMarketKey.sBTCPERP]: {
        key: futures_1.FuturesMarketKey.sBTCPERP,
        asset: futures_1.FuturesMarketAsset.sBTC,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
            testnet: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
        },
    },
    [futures_1.FuturesMarketKey.sLINKPERP]: {
        key: futures_1.FuturesMarketKey.sLINKPERP,
        asset: futures_1.FuturesMarketAsset.LINK,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
            testnet: '0x83be4ed61dd8a3518d198098ce37240c494710a7b9d85e35d9fceac21df08994',
        },
    },
    [futures_1.FuturesMarketKey.sSOLPERP]: {
        key: futures_1.FuturesMarketKey.sSOLPERP,
        asset: futures_1.FuturesMarketAsset.SOL,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
            testnet: '0xfe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd',
        },
    },
    [futures_1.FuturesMarketKey.sAVAXPERP]: {
        key: futures_1.FuturesMarketKey.sAVAXPERP,
        asset: futures_1.FuturesMarketAsset.AVAX,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
            testnet: '0xd7566a3ba7f7286ed54f4ae7e983f4420ae0b1e0f3892e11f9c4ab107bbad7b9',
        },
    },
    [futures_1.FuturesMarketKey.sAAVEPERP]: {
        key: futures_1.FuturesMarketKey.sAAVEPERP,
        asset: futures_1.FuturesMarketAsset.AAVE,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
            testnet: '0xd6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5',
        },
    },
    [futures_1.FuturesMarketKey.sUNIPERP]: {
        key: futures_1.FuturesMarketKey.sUNIPERP,
        asset: futures_1.FuturesMarketAsset.UNI,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
            testnet: '0x64ae1fc7ceacf2cd59bee541382ff3770d847e63c40eb6cf2413e7de5e93078a',
        },
    },
    [futures_1.FuturesMarketKey.sMATICPERP]: {
        key: futures_1.FuturesMarketKey.sMATICPERP,
        asset: futures_1.FuturesMarketAsset.MATIC,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
            testnet: '0xd2c2c1f2bba8e0964f9589e060c2ee97f5e19057267ac3284caef3bd50bd2cb5',
        },
    },
    [futures_1.FuturesMarketKey.sXAUPERP]: {
        key: futures_1.FuturesMarketKey.sXAUPERP,
        asset: futures_1.FuturesMarketAsset.XAU,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
            testnet: '0x30a19158f5a54c0adf8fb7560627343f22a1bc852b89d56be1accdc5dbf96d0e',
        },
    },
    [futures_1.FuturesMarketKey.sXAGPERP]: {
        key: futures_1.FuturesMarketKey.sXAGPERP,
        asset: futures_1.FuturesMarketAsset.XAG,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e',
            testnet: '0x321ba4d608fa75ba76d6d73daa715abcbdeb9dba02257f05a1b59178b49f599b',
        },
    },
    [futures_1.FuturesMarketKey.sEURPERP]: {
        key: futures_1.FuturesMarketKey.sEURPERP,
        asset: futures_1.FuturesMarketAsset.EUR,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
            testnet: '0xc1b12769f6633798d45adfd62bfc70114839232e2949b01fb3d3f927d2606154',
        },
    },
    [futures_1.FuturesMarketKey.sAPEPERP]: {
        key: futures_1.FuturesMarketKey.sAPEPERP,
        asset: futures_1.FuturesMarketAsset.APE,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
            testnet: '0xcb1743d0e3e3eace7e84b8230dc082829813e3ab04e91b503c08e9a441c0ea8b',
        },
    },
    [futures_1.FuturesMarketKey.sDYDXPERP]: {
        key: futures_1.FuturesMarketKey.sDYDXPERP,
        asset: futures_1.FuturesMarketAsset.DYDX,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b',
            testnet: '0x05a934cb3bbadef93b525978ab5bd3d5ce3b8fc6717b9ea182a688c5d8ee8e02',
        },
    },
    [futures_1.FuturesMarketKey.sBNBPERP]: {
        key: futures_1.FuturesMarketKey.sBNBPERP,
        asset: futures_1.FuturesMarketAsset.BNB,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
            testnet: '0xecf553770d9b10965f8fb64771e93f5690a182edc32be4a3236e0caaa6e0581a',
        },
    },
    [futures_1.FuturesMarketKey.sDOGEPERP]: {
        key: futures_1.FuturesMarketKey.sDOGEPERP,
        asset: futures_1.FuturesMarketAsset.DOGE,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
            testnet: '0x31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae',
        },
    },
    [futures_1.FuturesMarketKey.sOPPERP]: {
        key: futures_1.FuturesMarketKey.sOPPERP,
        asset: futures_1.FuturesMarketAsset.OP,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
            testnet: '0x71334dcd37620ce3c33e3bafef04cc80dec083042e49b734315b36d1aad7991f',
        },
    },
    [futures_1.FuturesMarketKey.sARBPERP]: {
        key: futures_1.FuturesMarketKey.sARBPERP,
        asset: futures_1.FuturesMarketAsset.ARB,
        supports: 'mainnet',
        version: 2,
        pythIds: {
            mainnet: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
            testnet: '0x37f40d2898159e8f2e52b93cb78f47cc3829a31e525ab975c49cc5c5d9176378',
        },
    },
    [futures_1.FuturesMarketKey.sATOMPERP]: {
        key: futures_1.FuturesMarketKey.sATOMPERP,
        asset: futures_1.FuturesMarketAsset.ATOM,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
            testnet: '0x61226d39beea19d334f17c2febce27e12646d84675924ebb02b9cdaea68727e3',
        },
    },
    [futures_1.FuturesMarketKey.sFTMPERP]: {
        key: futures_1.FuturesMarketKey.sFTMPERP,
        asset: futures_1.FuturesMarketAsset.FTM,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
            testnet: '0x9b7bfd7654cbb80099d5edc0a29159afc9e9b4636c811cf8c3b95bd11dd8e3dd',
        },
    },
    [futures_1.FuturesMarketKey.sNEARPERP]: {
        key: futures_1.FuturesMarketKey.sNEARPERP,
        asset: futures_1.FuturesMarketAsset.NEAR,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
            testnet: '0x27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4',
        },
    },
    [futures_1.FuturesMarketKey.sFLOWPERP]: {
        key: futures_1.FuturesMarketKey.sFLOWPERP,
        asset: futures_1.FuturesMarketAsset.FLOW,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x2fb245b9a84554a0f15aa123cbb5f64cd263b59e9a87d80148cbffab50c69f30',
            testnet: '0xaa67a6594d0e1578faa3bba80bec5b31e461b945e4fbab59eeab38ece09335fb',
        },
    },
    [futures_1.FuturesMarketKey.sAXSPERP]: {
        key: futures_1.FuturesMarketKey.sAXSPERP,
        asset: futures_1.FuturesMarketAsset.AXS,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xb7e3904c08ddd9c0c10c6d207d390fd19e87eb6aab96304f571ed94caebdefa0',
            testnet: '0xb327d9cf0ecd793a175fa70ac8d2dc109d4462758e556962c4a87b02ec4f3f15',
        },
    },
    [futures_1.FuturesMarketKey.sAUDPERP]: {
        key: futures_1.FuturesMarketKey.sAUDPERP,
        asset: futures_1.FuturesMarketAsset.AUD,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80',
            testnet: '0x2646ca1e1186fd2bb48b2ab3effa841d233b7e904b2caebb19c8030784a89c97',
        },
    },
    [futures_1.FuturesMarketKey.sGBPPERP]: {
        key: futures_1.FuturesMarketKey.sGBPPERP,
        asset: futures_1.FuturesMarketAsset.GBP,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
            testnet: '0xbcbdc2755bd74a2065f9d3283c2b8acbd898e473bdb90a6764b3dbd467c56ecd',
        },
    },
    //
    [futures_1.FuturesMarketKey.sAPTPERP]: {
        key: futures_1.FuturesMarketKey.sAPTPERP,
        asset: futures_1.FuturesMarketAsset.APT,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
            testnet: '0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e',
        },
    },
    [futures_1.FuturesMarketKey.sLDOPERP]: {
        key: futures_1.FuturesMarketKey.sLDOPERP,
        asset: futures_1.FuturesMarketAsset.LDO,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad',
            testnet: '0x69b9ca2e7159fe570844c22bac849c490e0ddfd0349626c19fd7d65509e192a3',
        },
    },
    [futures_1.FuturesMarketKey.sADAPERP]: {
        key: futures_1.FuturesMarketKey.sADAPERP,
        asset: futures_1.FuturesMarketAsset.ADA,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
            testnet: '0x73dc009953c83c944690037ea477df627657f45c14f16ad3a61089c5a3f9f4f2',
        },
    },
    [futures_1.FuturesMarketKey.sGMXPERP]: {
        key: futures_1.FuturesMarketKey.sGMXPERP,
        asset: futures_1.FuturesMarketAsset.GMX,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xb962539d0fcb272a494d65ea56f94851c2bcf8823935da05bd628916e2e9edbf',
            testnet: '0x4b57c2471f6ab9250d26b7e0ff8807bfd620a609503f52b0b67645f69eb2d5c5',
        },
    },
    [futures_1.FuturesMarketKey.sFILPERP]: {
        key: futures_1.FuturesMarketKey.sFILPERP,
        asset: futures_1.FuturesMarketAsset.FIL,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e',
            testnet: '0xb5622d32f36dc820af288aab779133ef1205d3123bbe256603849b820de48b87',
        },
    },
    [futures_1.FuturesMarketKey.sLTCPERP]: {
        key: futures_1.FuturesMarketKey.sLTCPERP,
        asset: futures_1.FuturesMarketAsset.LTC,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
            testnet: '0x997e0bf451cb36b4aea096e6b5c254d700922211dd933d9d17c467f0d6f34321',
        },
    },
    [futures_1.FuturesMarketKey.sBCHPERP]: {
        key: futures_1.FuturesMarketKey.sBCHPERP,
        asset: futures_1.FuturesMarketAsset.BCH,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3',
            testnet: '0x30029479598797290e3638a1712c29bde2367d0eca794f778b25b5a472f192de',
        },
    },
    [futures_1.FuturesMarketKey.sSHIBPERP]: {
        key: futures_1.FuturesMarketKey.sSHIBPERP,
        asset: futures_1.FuturesMarketAsset.SHIB,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a',
            testnet: '0x672fbb7d9ec665cfbe8c2ffa643ba321a047b7a72d7b6d7c3d8fb120fc40954b',
        },
    },
    [futures_1.FuturesMarketKey.sCRVPERP]: {
        key: futures_1.FuturesMarketKey.sCRVPERP,
        asset: futures_1.FuturesMarketAsset.CRV,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8',
            testnet: '0x94bce4aee88fdfa5b58d81090bd6b3784717fa6df85419d9f04433bb3d615d5c',
        },
    },
    [futures_1.FuturesMarketKey.sSUIPERP]: {
        key: futures_1.FuturesMarketKey.sSUIPERP,
        asset: futures_1.FuturesMarketAsset.SUI,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
            testnet: '0x50c67b3fd225db8912a424dd4baed60ffdde625ed2feaaf283724f9608fea266',
        },
    },
    [futures_1.FuturesMarketKey.sPEPEPERP]: {
        key: futures_1.FuturesMarketKey.sPEPEPERP,
        asset: futures_1.FuturesMarketAsset.PEPE,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4',
            testnet: '0xed82efbfade01083ffa8f64664c86af39282c9f084877066ae72b635e77718f0',
        },
    },
    [futures_1.FuturesMarketKey.sBLURPERP]: {
        key: futures_1.FuturesMarketKey.sBLURPERP,
        asset: futures_1.FuturesMarketAsset.BLUR,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x856aac602516addee497edf6f50d39e8c95ae5fb0da1ed434a8c2ab9c3e877e9',
            testnet: '0xbe2dbc97659e92bf07462aeda414195246515e6b17abd6997f0ab2297cb03e1d',
        },
    },
    [futures_1.FuturesMarketKey.sXRPPERP]: {
        key: futures_1.FuturesMarketKey.sXRPPERP,
        asset: futures_1.FuturesMarketAsset.XRP,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
            testnet: '0xbfaf7739cb6fe3e1c57a0ac08e1d931e9e6062d476fa57804e165ab572b5b621',
        },
    },
    [futures_1.FuturesMarketKey.sDOTPERP]: {
        key: futures_1.FuturesMarketKey.sDOTPERP,
        asset: futures_1.FuturesMarketAsset.DOT,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
            testnet: '0x36032e522b810babd8e3148e9f0d588af9e95e93b97ffb58566b837fdbd31f7f',
        },
    },
    [futures_1.FuturesMarketKey.sTRXPERP]: {
        key: futures_1.FuturesMarketKey.sTRXPERP,
        asset: futures_1.FuturesMarketAsset.TRX,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b',
            testnet: '0x013317758a5b499650d72edcd7ba12bb5cc54ce9434196b607fa5e01e0f7797b',
        },
    },
    [futures_1.FuturesMarketKey.sFLOKIPERP]: {
        key: futures_1.FuturesMarketKey.sFLOKIPERP,
        asset: futures_1.FuturesMarketAsset.FLOKI,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293',
            testnet: '0x57596fe1a697014b962ac9e693dee99c4bb01d6c5eca271a1a26ad475a92cdbd',
        },
    },
    [futures_1.FuturesMarketKey.sINJPERP]: {
        key: futures_1.FuturesMarketKey.sINJPERP,
        asset: futures_1.FuturesMarketAsset.INJ,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
            testnet: '0x2d9315a88f3019f8efa88dfe9c0f0843712da0bac814461e27733f6b83eb51b3',
        },
    },
    [futures_1.FuturesMarketKey.sSTETHPERP]: {
        key: futures_1.FuturesMarketKey.sSTETHPERP,
        asset: futures_1.FuturesMarketAsset.STETH,
        supports: 'both',
        version: 2,
        pythIds: {
            mainnet: '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5',
            testnet: '0xb7abd25a76ddaffdf847224f03198ccb92723f90b2429cf33f0eecb96e352a86',
        },
    },
};
exports.MARKET_ASSETS_BY_PYTH_ID = Object.values(exports.MARKETS)
    .filter((m) => !!m.pythIds)
    .reduce((acc, m) => {
    acc[m.pythIds.mainnet] = m.asset;
    acc[m.pythIds.testnet] = m.asset;
    return acc;
}, {});
exports.MARKETS_LIST = Object.values(exports.MARKETS).filter((m) => !m.disabled);
exports.V2_MARKETS = Object.entries(exports.MARKETS).reduce((acc, [key, m]) => {
    if (m.version === 2)
        acc[key] = m;
    return acc;
}, {});
exports.V2_MARKETS_LIST = Object.values(exports.V2_MARKETS).filter((m) => !m.disabled);
exports.MAINNET_MARKETS = exports.MARKETS_LIST.filter((m) => m.supports === 'mainnet' || m.supports === 'both');
exports.TESTNET_MARKETS = exports.MARKETS_LIST.filter((m) => m.supports === 'testnet' || m.supports === 'both');
exports.BPS_CONVERSION = 10000;
exports.DEFAULT_DESIRED_TIMEDELTA = 0;
exports.AGGREGATE_ASSET_KEY = '0x';
// subgraph fragments
exports.ISOLATED_MARGIN_FRAGMENT = (0, graphql_request_1.gql) `
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
exports.SMART_MARGIN_FRAGMENT = (0, graphql_request_1.gql) `
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
