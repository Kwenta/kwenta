"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReasonFromCode = exports.getProxySynthSymbol = void 0;
const ethcall_1 = require("ethcall");
const ERC20_json_1 = __importDefault(require("../contracts/abis/ERC20.json"));
const getProxySynthSymbol = (address) => {
    const c = new ethcall_1.Contract(address, ERC20_json_1.default);
    return c.symbol();
};
exports.getProxySynthSymbol = getProxySynthSymbol;
const getReasonFromCode = (reasonCode) => {
    switch (Number(reasonCode)) {
        case 1:
            return 'system-upgrade';
        case 2:
            return 'market-closure';
        case 3:
        case 55:
        case 65:
            return 'circuit-breaker';
        case 99999:
            return 'emergency';
        default:
            return 'market-closure';
    }
};
exports.getReasonFromCode = getReasonFromCode;
