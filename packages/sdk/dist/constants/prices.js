"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICE_UPDATE_THROTTLE = exports.PYTH_IDS = exports.ADDITIONAL_SYNTHS = exports.MAIN_ENDPOINT_OP_GOERLI = exports.MAIN_ENDPOINT_OP_MAINNET = void 0;
const strings_1 = require("@ethersproject/strings");
const futures_1 = require("./futures");
exports.MAIN_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-latest-rates/api`;
exports.MAIN_ENDPOINT_OP_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-latest-rates';
// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
exports.ADDITIONAL_SYNTHS = [
    'SNX',
    'ETH',
    'BTC',
    'LINK',
    'SOL',
    'AVAX',
    'MATIC',
    'EUR',
    'AAVE',
    'UNI',
    'XAU',
    'XAG',
    'APE',
    'DYDX',
    'BNB',
    'XMR',
    'DOGE',
    'OP',
    'ATOM',
    'FLOW',
    'FTM',
    'NEAR',
    'AXS',
    'AUD',
    'GBP',
].map(strings_1.formatBytes32String);
exports.PYTH_IDS = {
    mainnet: futures_1.V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds.mainnet),
    testnet: futures_1.V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds.testnet),
};
// Allow to be set from config so users can customise
exports.PRICE_UPDATE_THROTTLE = 1000;
