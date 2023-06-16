"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYNTH_SWAP_OPTIMISM_ADDRESS = exports.KWENTA_REFERRAL_ADDRESS = exports.DEFAULT_1INCH_SLIPPAGE = exports.ATOMIC_EXCHANGE_SLIPPAGE = exports.KWENTA_ADDRESS = exports.ETH_ADDRESS = exports.OP_ADDRESS = exports.ETH_COINGECKO_ADDRESS = exports.ATOMIC_EXCHANGES_L1 = exports.CRYPTO_CURRENCY_MAP = exports.CRYPTO_CURRENCY = exports.ADDITIONAL_MARKETS = exports.DEFAULT_BUFFER = exports.FILTERED_TOKENS = exports.PROTOCOLS = exports.CG_BASE_API_URL = void 0;
const keyBy_1 = __importDefault(require("lodash/keyBy"));
const futures_1 = require("../types/futures");
exports.CG_BASE_API_URL = 'https://api.coingecko.com/api/v3';
exports.PROTOCOLS = 'OPTIMISM_UNISWAP_V3,OPTIMISM_SYNTHETIX,OPTIMISM_SYNTHETIX_WRAPPER,OPTIMISM_ONE_INCH_LIMIT_ORDER,OPTIMISM_ONE_INCH_LIMIT_ORDER_V2,OPTIMISM_CURVE,OPTIMISM_BALANCER_V2,OPTIMISM_VELODROME,OPTIMISM_KYBERSWAP_ELASTIC';
exports.FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];
exports.DEFAULT_BUFFER = 0.2;
exports.ADDITIONAL_MARKETS = new Set([
    futures_1.FuturesMarketKey.sAPEPERP,
    futures_1.FuturesMarketKey.sDYDXPERP,
    futures_1.FuturesMarketKey.sXAUPERP,
    futures_1.FuturesMarketKey.sXAGPERP,
]);
exports.CRYPTO_CURRENCY = [
    'KNC',
    'COMP',
    'REN',
    'LEND',
    'SNX',
    'BTC',
    'ETH',
    'XRP',
    'BCH',
    'LTC',
    'EOS',
    'BNB',
    'XTZ',
    'XMR',
    'ADA',
    'LINK',
    'TRX',
    'DASH',
    'ETC',
];
exports.CRYPTO_CURRENCY_MAP = (0, keyBy_1.default)(exports.CRYPTO_CURRENCY);
exports.ATOMIC_EXCHANGES_L1 = [
    'sBTC',
    'sETH',
    'sEUR',
    'sUSD',
    'sCHF',
    'sJPY',
    'sAUD',
    'sGBP',
    'sKRW',
];
// For coingecko API
exports.ETH_COINGECKO_ADDRESS = '0x4200000000000000000000000000000000000006';
exports.OP_ADDRESS = '0x4200000000000000000000000000000000000042';
exports.ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // For 1inch API
exports.KWENTA_ADDRESS = '0x920cf626a271321c151d027030d5d08af699456b';
exports.ATOMIC_EXCHANGE_SLIPPAGE = '0.01';
// for DEX aggregators like 1inch
exports.DEFAULT_1INCH_SLIPPAGE = 3;
exports.KWENTA_REFERRAL_ADDRESS = '0x08e30BFEE9B73c18F9770288DDd13203A4887460';
exports.SYNTH_SWAP_OPTIMISM_ADDRESS = '0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6';
