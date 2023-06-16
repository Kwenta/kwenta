"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatesEndpoint = exports.RATES_ENDPOINTS = exports.RATES_ENDPOINT_GOERLI = exports.RATES_ENDPOINT_OP_GOERLI = exports.RATES_ENDPOINT_OP_MAINNET = void 0;
exports.RATES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-latest-rates/api`;
exports.RATES_ENDPOINT_OP_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-latest-rates';
exports.RATES_ENDPOINT_GOERLI = 'https://api.thegraph.com/subgraphs/name/kwenta/goerli-main';
exports.RATES_ENDPOINTS = {
    5: exports.RATES_ENDPOINT_GOERLI,
    10: exports.RATES_ENDPOINT_OP_MAINNET,
    420: exports.RATES_ENDPOINT_OP_GOERLI,
};
const getRatesEndpoint = (networkId) => {
    return exports.RATES_ENDPOINTS[networkId] || exports.RATES_ENDPOINTS[10];
};
exports.getRatesEndpoint = getRatesEndpoint;
