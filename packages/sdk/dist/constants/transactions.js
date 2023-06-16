"use strict";
// Copied over from: https://github.com/Synthetixio/js-monorepo
Object.defineProperty(exports, "__esModule", { value: true });
exports.GWEI_DECIMALS = exports.ETH_UNIT = exports.DEFAULT_GAS_BUFFER = exports.TRANSACTION_EVENTS_MAP = exports.TRANSACTION_EVENTS = void 0;
exports.TRANSACTION_EVENTS = [
    'txSent',
    'txConfirmed',
    'txFailed',
    'txError',
];
exports.TRANSACTION_EVENTS_MAP = Object.fromEntries(exports.TRANSACTION_EVENTS.map((event) => [event, event]));
exports.DEFAULT_GAS_BUFFER = 5000;
exports.ETH_UNIT = 1000000000000000000;
exports.GWEI_DECIMALS = 9;
