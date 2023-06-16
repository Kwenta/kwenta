"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const wei_1 = require("@synthetixio/wei");
const lodash_1 = require("lodash");
const number_1 = require("../constants/number");
const general_1 = require("../utils/general");
const sdkErrors = __importStar(require("../common/errors"));
const strings_1 = require("@ethersproject/strings");
class SynthsService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    getSynthBalances(walletAddress) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.SynthUtil) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const balancesMap = {};
            const [currencyKeys, synthsBalances, synthsUSDBalances,] = yield this.sdk.context.contracts.SynthUtil.synthsBalances(walletAddress);
            let totalUSDBalance = (0, wei_1.wei)(0);
            currencyKeys.forEach((currencyKeyBytes32, idx) => {
                const balance = (0, wei_1.wei)(synthsBalances[idx]);
                if (balance.gt(0)) {
                    const synthName = (0, strings_1.parseBytes32String)(currencyKeyBytes32);
                    const usdBalance = (0, wei_1.wei)(synthsUSDBalances[idx]);
                    balancesMap[synthName] = { currencyKey: synthName, balance, usdBalance };
                    totalUSDBalance = totalUSDBalance.add(usdBalance);
                }
            });
            const balances = {
                balancesMap,
                balances: (0, lodash_1.orderBy)(Object.values(balancesMap).filter(general_1.notNill), (balance) => balance.usdBalance.toNumber(), 'desc'),
                totalUSDBalance,
                susdWalletBalance: (_b = (_a = balancesMap === null || balancesMap === void 0 ? void 0 : balancesMap['sUSD']) === null || _a === void 0 ? void 0 : _a.balance) !== null && _b !== void 0 ? _b : number_1.ZERO_WEI,
            };
            return balances;
        });
    }
}
exports.default = SynthsService;
