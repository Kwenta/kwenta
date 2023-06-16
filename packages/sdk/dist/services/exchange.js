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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore TODO: remove once types are added
const synthswap_1 = __importDefault(require("@kwenta/synthswap"));
const wei_1 = require("@synthetixio/wei");
const axios_1 = __importDefault(require("axios"));
const ethcall_1 = require("ethcall");
const ethers_1 = require("ethers");
const bignumber_1 = require("@ethersproject/bignumber");
const strings_1 = require("@ethersproject/strings");
const lodash_1 = require("lodash");
const gas_1 = require("../common/gas");
const futures_1 = require("../constants/futures");
const number_1 = require("../constants/number");
const ERC20_json_1 = __importDefault(require("../contracts/abis/ERC20.json"));
const exchange_1 = require("../utils/exchange");
const synths_1 = require("../utils/synths");
const transactions_1 = require("../utils/transactions");
const sdkErrors = __importStar(require("../common/errors"));
const exchange_2 = require("../constants/exchange");
const synths_2 = require("../data/synths");
class ExchangeService {
    constructor(sdk) {
        this.tokensMap = {};
        this.tokenList = [];
        this.sdk = sdk;
    }
    get exchangeRates() {
        return this.sdk.prices.currentPrices.onChain;
    }
    getTxProvider(baseCurrencyKey, quoteCurrencyKey) {
        var _a, _b;
        if (!baseCurrencyKey || !quoteCurrencyKey)
            return undefined;
        if (((_a = this.synthsMap) === null || _a === void 0 ? void 0 : _a[baseCurrencyKey]) &&
            ((_b = this.synthsMap) === null || _b === void 0 ? void 0 : _b[quoteCurrencyKey]))
            return 'synthetix';
        if (this.tokensMap[baseCurrencyKey] && this.tokensMap[quoteCurrencyKey])
            return '1inch';
        return 'synthswap';
    }
    getTradePrices(txProvider, quoteCurrencyKey, baseCurrencyKey, quoteAmountWei, baseAmountWei) {
        return __awaiter(this, void 0, void 0, function* () {
            const coinGeckoPrices = yield this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey);
            const [quotePriceRate, basePriceRate] = yield Promise.all([quoteCurrencyKey, baseCurrencyKey].map((currencyKey) => this.getPriceRate(currencyKey, txProvider, coinGeckoPrices)));
            let quoteTradePrice = quoteAmountWei.mul(quotePriceRate || 0);
            let baseTradePrice = baseAmountWei.mul(basePriceRate || 0);
            if (this.sUSDRate) {
                quoteTradePrice = quoteTradePrice.div(this.sUSDRate);
                baseTradePrice = baseTradePrice.div(this.sUSDRate);
            }
            return { quoteTradePrice, baseTradePrice };
        });
    }
    getSlippagePercent(quoteCurrencyKey, baseCurrencyKey, quoteAmountWei, baseAmountWei) {
        return __awaiter(this, void 0, void 0, function* () {
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            if (txProvider === '1inch') {
                const { quoteTradePrice: totalTradePrice, baseTradePrice: estimatedBaseTradePrice, } = yield this.getTradePrices(txProvider, quoteCurrencyKey, baseCurrencyKey, quoteAmountWei, baseAmountWei);
                if (totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
                    return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
                }
            }
            return undefined;
        });
    }
    getBaseFeeRate(baseCurrencyKey, quoteCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.SystemSettings) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = yield Promise.all([
                this.sdk.context.contracts.SystemSettings.exchangeFeeRate(ethers_1.ethers.utils.formatBytes32String(baseCurrencyKey)),
                this.sdk.context.contracts.SystemSettings.exchangeFeeRate(ethers_1.ethers.utils.formatBytes32String(quoteCurrencyKey)),
            ]);
            return sourceCurrencyFeeRate && destinationCurrencyFeeRate
                ? (0, wei_1.wei)(sourceCurrencyFeeRate.add(destinationCurrencyFeeRate))
                : (0, wei_1.wei)(0);
        });
    }
    getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.Exchanger) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const exchangeFeeRate = yield this.sdk.context.contracts.Exchanger.feeRateForExchange(ethers_1.ethers.utils.formatBytes32String(quoteCurrencyKey), ethers_1.ethers.utils.formatBytes32String(baseCurrencyKey));
            return (0, wei_1.wei)(exchangeFeeRate);
        });
    }
    getRate(baseCurrencyKey, quoteCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
            const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
            const [[quoteRate, baseRate], coinGeckoPrices] = yield Promise.all([
                this.getPairRates(quoteCurrencyKey, baseCurrencyKey),
                this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey),
            ]);
            const base = baseRate.lte(0)
                ? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
                : baseRate;
            const quote = quoteRate.lte(0)
                ? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
                : quoteRate;
            return base.gt(0) && quote.gt(0) ? quote.div(base) : (0, wei_1.wei)(0);
        });
    }
    getOneInchTokenList() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.oneInchApiUrl + 'tokens');
            const tokensMap = response.data.tokens || {};
            const chainId = this.sdk.context.isL2 ? 10 : 1;
            const tokens = Object.values(tokensMap).map((t) => (Object.assign(Object.assign({}, t), { chainId, tags: [] })));
            return {
                tokens,
                tokensMap: (0, lodash_1.keyBy)(tokens, 'symbol'),
                symbols: tokens.map((token) => token.symbol),
            };
        });
    }
    getFeeReclaimPeriod(currencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.Exchanger) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const maxSecsLeftInWaitingPeriod = (yield this.sdk.context.contracts.Exchanger.maxSecsLeftInWaitingPeriod(this.sdk.context.walletAddress, ethers_1.ethers.utils.formatBytes32String(currencyKey)));
            return Number(maxSecsLeftInWaitingPeriod);
        });
    }
    swapSynthSwap(fromToken, toToken, fromAmount, metaOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sdk.context.networkId !== 10)
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            const sUSD = this.tokensMap['sUSD'];
            const oneInchFrom = this.tokensMap[fromToken.symbol] ? sUSD.address : fromToken.address;
            const oneInchTo = this.tokensMap[toToken.symbol] ? sUSD.address : toToken.address;
            const fromSymbolBytes = ethers_1.ethers.utils.formatBytes32String(fromToken.symbol);
            const sUSDBytes = ethers_1.ethers.utils.formatBytes32String('sUSD');
            let synthAmountEth = fromAmount;
            if (this.tokensMap[fromToken.symbol]) {
                if (!this.sdk.context.contracts.Exchanger) {
                    throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
                }
                const fromAmountWei = (0, wei_1.wei)(fromAmount).toString(0, true);
                const amounts = yield this.sdk.context.contracts.Exchanger.getAmountsForExchange(fromAmountWei, fromSymbolBytes, sUSDBytes);
                const usdValue = amounts.amountReceived.sub(amounts.fee);
                synthAmountEth = ethers_1.ethers.utils.formatEther(usdValue);
            }
            const params = yield this.getOneInchSwapParams(oneInchFrom, oneInchTo, synthAmountEth, fromToken.decimals);
            const formattedData = (0, synthswap_1.default)(params, exchange_2.SYNTH_SWAP_OPTIMISM_ADDRESS);
            const SynthSwap = this.sdk.context.contracts.SynthSwap;
            if (!SynthSwap) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const contractFunc = metaOnly === 'meta_tx'
                ? SynthSwap.populateTransaction
                : metaOnly === 'estimate_gas'
                    ? SynthSwap.estimateGas
                    : SynthSwap;
            if (this.tokensMap[toToken.symbol]) {
                const symbolBytes = ethers_1.ethers.utils.formatBytes32String(toToken.symbol);
                if (formattedData.functionSelector === 'swap') {
                    return metaOnly
                        ? contractFunc.swapInto(symbolBytes, formattedData.data)
                        : this.sdk.transactions.createContractTxn(SynthSwap, 'swapInto', [
                            symbolBytes,
                            formattedData.data,
                        ]);
                }
                else {
                    return metaOnly
                        ? contractFunc.uniswapSwapInto(symbolBytes, fromToken.address, params.fromTokenAmount, formattedData.data)
                        : this.sdk.transactions.createContractTxn(SynthSwap, 'uniswapSwapInto', [
                            symbolBytes,
                            fromToken.address,
                            params.fromTokenAmount,
                            formattedData.data,
                        ]);
                }
            }
            else {
                if (formattedData.functionSelector === 'swap') {
                    return metaOnly
                        ? contractFunc.swapOutOf(fromSymbolBytes, (0, wei_1.wei)(fromAmount).toString(0, true), formattedData.data)
                        : this.sdk.transactions.createContractTxn(SynthSwap, 'swapOutOf', [
                            fromSymbolBytes,
                            (0, wei_1.wei)(fromAmount).toString(0, true),
                            formattedData.data,
                        ]);
                }
                else {
                    const usdValue = ethers_1.ethers.utils.parseEther(synthAmountEth).toString();
                    return metaOnly
                        ? contractFunc.uniswapSwapOutOf(fromSymbolBytes, toToken.address, (0, wei_1.wei)(fromAmount).toString(0, true), usdValue, formattedData.data)
                        : this.sdk.transactions.createContractTxn(SynthSwap, 'uniswapSwapOutOf', [
                            fromSymbolBytes,
                            toToken.address,
                            (0, wei_1.wei)(fromAmount).toString(0, true),
                            usdValue,
                            formattedData.data,
                        ]);
                }
            }
        });
    }
    swapOneInchMeta(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = yield this.getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals);
            const { from, to, data, value } = params.tx;
            return this.sdk.context.signer.populateTransaction({
                from,
                to,
                data,
                value: ethers_1.ethers.BigNumber.from(value),
            });
        });
    }
    swapOneInch(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = yield this.getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals);
            const { from, to, data, value } = params.tx;
            return this.sdk.transactions.createEVMTxn({ from, to, data, value });
        });
    }
    swapOneInchGasEstimate(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = yield this.getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals);
            return params.tx.gas;
        });
    }
    getNumEntries(currencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.Exchanger) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { numEntries } = yield this.sdk.context.contracts.Exchanger.settlementOwing(this.sdk.context.walletAddress, ethers_1.ethers.utils.formatBytes32String(currencyKey));
            return numEntries ? Number(numEntries.toString()) : 0;
        });
    }
    getAtomicRates(currencyKey) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.ExchangeRates) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { value } = yield this.sdk.context.contracts.ExchangeRates.effectiveAtomicValueAndRates(ethers_1.ethers.utils.formatBytes32String(currencyKey), number_1.UNIT_BIG_NUM, ethers_1.ethers.utils.formatBytes32String('sUSD'));
            return (_a = (0, wei_1.wei)(value)) !== null && _a !== void 0 ? _a : (0, wei_1.wei)(0);
        });
    }
    approveSwap(quoteCurrencyKey, baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const quoteCurrencyContract = this.getQuoteCurrencyContract(quoteCurrencyKey);
            const approveAddress = yield this.getApproveAddress(txProvider);
            if (quoteCurrencyContract) {
                const { hash } = yield this.sdk.transactions.createContractTxn(quoteCurrencyContract, 'approve', [approveAddress, ethers_1.ethers.constants.MaxUint256]);
                return hash;
            }
            return undefined;
        });
    }
    handleSettle(baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.isL2) {
                throw new Error(sdkErrors.REQUIRES_L2);
            }
            const numEntries = yield this.getNumEntries(baseCurrencyKey);
            if (numEntries > 12) {
                const destinationCurrencyKey = ethers_1.ethers.utils.formatBytes32String(baseCurrencyKey);
                const { hash } = yield this.sdk.transactions.createSynthetixTxn('Exchanger', 'settle', [
                    this.sdk.context.walletAddress,
                    destinationCurrencyKey,
                ]);
                return hash;
            }
            return undefined;
        });
    }
    // TODO: Refactor handleExchange
    handleExchange(quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
            const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
            const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey);
            let tx = null;
            if (txProvider === '1inch' && !!this.tokensMap) {
                tx = yield this.swapOneInch(quoteCurrencyTokenAddress, baseCurrencyTokenAddress, quoteAmount, quoteDecimals);
            }
            else if (txProvider === 'synthswap') {
                // @ts-ignore TODO: Fix variable types
                tx = yield this.swapSynthSwap(this.allTokensMap[quoteCurrencyKey], this.allTokensMap[baseCurrencyKey], quoteAmount);
            }
            else {
                const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);
                const exchangeParams = this.getExchangeParams(quoteCurrencyKey, baseCurrencyKey, (0, wei_1.wei)(quoteAmount), (0, wei_1.wei)(baseAmount).mul((0, wei_1.wei)(1).sub(exchange_2.ATOMIC_EXCHANGE_SLIPPAGE)), isAtomic);
                const shouldExchange = !!exchangeParams &&
                    !!this.sdk.context.walletAddress &&
                    !!this.sdk.context.contracts.Synthetix;
                if (shouldExchange) {
                    const { hash } = yield this.sdk.transactions.createSynthetixTxn('Synthetix', isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking', exchangeParams);
                    return hash;
                }
            }
            return tx === null || tx === void 0 ? void 0 : tx.hash;
        });
    }
    getTransactionFee(quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const gasPrices = yield (0, gas_1.getEthGasPrice)(this.sdk.context.networkId, this.sdk.context.provider);
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const ethPriceRate = this.getExchangeRatesForCurrencies(this.exchangeRates, 'sETH', 'sUSD');
            const gasPrice = gasPrices.fast;
            if (txProvider === 'synthswap' || txProvider === '1inch') {
                const gasInfo = yield this.getGasEstimateForExchange(txProvider, quoteCurrencyKey, baseCurrencyKey, quoteAmount);
                return (0, transactions_1.getTransactionPrice)(gasPrice, bignumber_1.BigNumber.from((gasInfo === null || gasInfo === void 0 ? void 0 : gasInfo.limit) || 0), ethPriceRate, (_a = gasInfo === null || gasInfo === void 0 ? void 0 : gasInfo.l1Fee) !== null && _a !== void 0 ? _a : number_1.ZERO_WEI);
            }
            else {
                if (!this.sdk.context.contracts.Synthetix) {
                    throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
                }
                const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);
                const exchangeParams = this.getExchangeParams(quoteCurrencyKey, baseCurrencyKey, (0, wei_1.wei)(quoteAmount || 0), (0, wei_1.wei)(baseAmount || 0).mul((0, wei_1.wei)(1).sub(exchange_2.ATOMIC_EXCHANGE_SLIPPAGE)), isAtomic);
                const method = isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking';
                const txn = {
                    to: this.sdk.context.contracts.Synthetix.address,
                    data: this.sdk.context.contracts.Synthetix.interface.encodeFunctionData(
                    // @ts-ignore TODO: Fix types
                    method, exchangeParams),
                    value: ethers_1.ethers.BigNumber.from(0),
                };
                const [baseGasLimit, optimismLayerOneFee] = yield Promise.all([
                    this.sdk.transactions.estimateGas(txn),
                    this.sdk.transactions.getOptimismLayerOneFees(txn),
                ]);
                const gasLimit = (0, wei_1.wei)(baseGasLimit !== null && baseGasLimit !== void 0 ? baseGasLimit : 0, 9)
                    .mul(1 + exchange_2.DEFAULT_BUFFER)
                    .toBN();
                return (0, transactions_1.getTransactionPrice)(gasPrice, gasLimit, ethPriceRate, optimismLayerOneFee);
            }
        });
    }
    getFeeCost(quoteCurrencyKey, baseCurrencyKey, quoteAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const coinGeckoPrices = yield this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey);
            const [exchangeFeeRate, quotePriceRate] = yield Promise.all([
                this.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
                this.getPriceRate(quoteCurrencyKey, txProvider, coinGeckoPrices),
            ]);
            const feeAmountInQuoteCurrency = (0, wei_1.wei)(quoteAmount).mul(exchangeFeeRate);
            return feeAmountInQuoteCurrency.mul(quotePriceRate);
        });
    }
    getApproveAddress(txProvider) {
        return txProvider !== '1inch' ? exchange_2.SYNTH_SWAP_OPTIMISM_ADDRESS : this.getOneInchApproveAddress();
    }
    checkAllowance(quoteCurrencyKey, baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const [quoteCurrencyContract, approveAddress] = yield Promise.all([
                this.getQuoteCurrencyContract(quoteCurrencyKey),
                this.getApproveAddress(txProvider),
            ]);
            if (!!quoteCurrencyContract) {
                const allowance = (yield quoteCurrencyContract.allowance(this.sdk.context.walletAddress, approveAddress));
                return (0, wei_1.wei)(ethers_1.ethers.utils.formatEther(allowance));
            }
        });
    }
    getCurrencyName(currencyKey) {
        var _a, _b;
        return (_b = (_a = this.allTokensMap) === null || _a === void 0 ? void 0 : _a[currencyKey]) === null || _b === void 0 ? void 0 : _b.name;
    }
    getOneInchQuote(baseCurrencyKey, quoteCurrencyKey, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const sUSD = this.tokensMap['sUSD'];
            const decimals = this.getTokenDecimals(quoteCurrencyKey);
            const quoteTokenAddress = this.getTokenAddress(quoteCurrencyKey);
            const baseTokenAddress = this.getTokenAddress(baseCurrencyKey);
            const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
            const synth = this.tokensMap[quoteCurrencyKey] || this.tokensMap[baseCurrencyKey];
            const synthUsdRate = synth ? this.getPairRates(synth, 'sUSD') : null;
            if (!quoteCurrencyKey || !baseCurrencyKey || !sUSD || !amount.length || (0, wei_1.wei)(amount).eq(0)) {
                return '';
            }
            if (txProvider === '1inch') {
                const estimatedAmount = yield this.quoteOneInch(quoteTokenAddress, baseTokenAddress, amount, decimals);
                return estimatedAmount;
            }
            if (this.tokensMap[quoteCurrencyKey]) {
                const usdAmount = (0, wei_1.wei)(amount).div(synthUsdRate);
                const estimatedAmount = yield this.quoteOneInch(sUSD.address, baseTokenAddress, usdAmount.toString(), decimals);
                return estimatedAmount;
            }
            else {
                const estimatedAmount = yield this.quoteOneInch(quoteTokenAddress, sUSD.address, amount, decimals);
                return (0, wei_1.wei)(estimatedAmount).mul(synthUsdRate).toString();
            }
        });
    }
    getPriceRate(currencyKey, txProvider, coinGeckoPrices) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const tokenAddress = this.getTokenAddress(currencyKey, true).toLowerCase();
            if (txProvider !== 'synthetix') {
                const sUSDRate = this.exchangeRates['sUSD'];
                const price = coinGeckoPrices && coinGeckoPrices[tokenAddress];
                if (price && (sUSDRate === null || sUSDRate === void 0 ? void 0 : sUSDRate.gt(0))) {
                    return (0, wei_1.wei)((_a = price.usd) !== null && _a !== void 0 ? _a : 0).div(sUSDRate);
                }
                else {
                    return (0, wei_1.wei)(0);
                }
            }
            else {
                return this.checkIsAtomic(currencyKey, 'sUSD')
                    ? yield this.getAtomicRates(currencyKey)
                    : this.getExchangeRatesForCurrencies(this.exchangeRates, currencyKey, 'sUSD');
            }
        });
    }
    getRedeemableDeprecatedSynths() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { SynthRedeemer } = this.sdk.context.contracts;
            const { SynthRedeemer: Redeemer } = this.sdk.context.multicallContracts;
            if (!SynthRedeemer || !Redeemer) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { walletAddress } = this.sdk.context;
            const synthDeprecatedFilter = SynthRedeemer.filters.SynthDeprecated();
            const deprecatedSynthsEvents = yield SynthRedeemer.queryFilter(synthDeprecatedFilter);
            const deprecatedProxySynthsAddresses = (_a = deprecatedSynthsEvents.map((e) => { var _a; return (_a = e.args) === null || _a === void 0 ? void 0 : _a.synth; }).filter(Boolean)) !== null && _a !== void 0 ? _a : [];
            const calls = [];
            for (const addr of deprecatedProxySynthsAddresses) {
                calls.push((0, synths_1.getProxySynthSymbol)(addr));
                calls.push(Redeemer.balanceOf(addr, walletAddress));
            }
            const redeemableSynthData = (yield this.sdk.context.multicallProvider.all(calls));
            let totalUSDBalance = (0, wei_1.wei)(0);
            const cryptoBalances = [];
            for (let i = 0; i < redeemableSynthData.length; i += 2) {
                const usdBalance = (0, wei_1.wei)(redeemableSynthData[i + 1]);
                if (usdBalance.gt(0)) {
                    totalUSDBalance = totalUSDBalance.add(usdBalance);
                    cryptoBalances.push({
                        currencyKey: redeemableSynthData[i],
                        proxyAddress: deprecatedProxySynthsAddresses[i],
                        balance: (0, wei_1.wei)(0),
                        usdBalance,
                    });
                }
            }
            return { balances: cryptoBalances, totalUSDBalance };
        });
    }
    validCurrencyKeys(quoteCurrencyKey, baseCurrencyKey) {
        return [quoteCurrencyKey, baseCurrencyKey].map((currencyKey) => {
            return (!!currencyKey &&
                (!!this.synthsMap[currencyKey] || !!this.tokensMap[currencyKey]));
        });
    }
    getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey, true).toLowerCase();
            const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase();
            const tokenAddresses = [quoteCurrencyTokenAddress, baseCurrencyTokenAddress];
            return this.batchGetCoingeckoPrices(tokenAddresses);
        });
    }
    batchGetCoingeckoPrices(tokenAddresses, include24hrChange = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = this.sdk.context.isL2 ? 'optimistic-ethereum' : 'ethereum';
            const response = yield axios_1.default.get(`${exchange_2.CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
                .join(',')
                .replace(exchange_2.ETH_ADDRESS, exchange_2.ETH_COINGECKO_ADDRESS)}&vs_currencies=usd${include24hrChange ? '&include_24hr_change=true' : ''}`);
            return response.data;
        });
    }
    get sUSDRate() {
        return this.exchangeRates['sUSD'];
    }
    getExchangeParams(quoteCurrencyKey, baseCurrencyKey, sourceAmount, minAmount, isAtomic) {
        const sourceCurrencyKey = ethers_1.ethers.utils.formatBytes32String(quoteCurrencyKey);
        const destinationCurrencyKey = ethers_1.ethers.utils.formatBytes32String(baseCurrencyKey);
        const sourceAmountBN = sourceAmount.toBN();
        if (isAtomic) {
            return [
                sourceCurrencyKey,
                sourceAmountBN,
                destinationCurrencyKey,
                futures_1.KWENTA_TRACKING_CODE,
                minAmount.toBN(),
            ];
        }
        else {
            return [
                sourceCurrencyKey,
                sourceAmountBN,
                destinationCurrencyKey,
                this.sdk.context.walletAddress,
                futures_1.KWENTA_TRACKING_CODE,
            ];
        }
    }
    getSynthsMap() {
        return this.synthsMap;
    }
    get synthsMap() {
        return (0, synths_2.getSynthsForNetwork)(this.sdk.context.networkId);
    }
    getOneInchTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokensMap, tokens } = yield this.getOneInchTokenList();
            this.tokensMap = tokensMap;
            this.tokenList = tokens;
            this.allTokensMap = Object.assign(Object.assign({}, this.synthsMap), tokensMap);
            return { tokensMap: this.tokensMap, tokenList: this.tokenList };
        });
    }
    getSynthSuspensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const { SystemStatus } = this.sdk.context.multicallContracts;
            const synthsMap = this.sdk.exchange.getSynthsMap();
            if (!SystemStatus) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const calls = [];
            for (let synth in synthsMap) {
                calls.push(SystemStatus.synthExchangeSuspension((0, strings_1.formatBytes32String)(synth)));
            }
            const responses = (yield this.sdk.context.multicallProvider.all(calls));
            let ret = {};
            let i = 0;
            for (let synth in synthsMap) {
                const [isSuspended, reason] = responses[i];
                const reasonCode = Number(reason);
                ret[synth] = {
                    isSuspended: responses[i][0],
                    reasonCode,
                    reason: isSuspended ? (0, synths_1.getReasonFromCode)(reasonCode) : null,
                };
                i++;
            }
            return ret;
        });
    }
    checkIsAtomic(baseCurrencyKey, quoteCurrencyKey) {
        if (this.sdk.context.isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
            return false;
        }
        return [baseCurrencyKey, quoteCurrencyKey].every((currency) => exchange_2.ATOMIC_EXCHANGES_L1.includes(currency));
    }
    getTokenDecimals(currencyKey) {
        return (0, lodash_1.get)(this.allTokensMap, [currencyKey, 'decimals'], undefined);
    }
    getQuoteCurrencyContract(quoteCurrencyKey) {
        if (this.allTokensMap[quoteCurrencyKey]) {
            const quoteTknAddress = this.getTokenAddress(quoteCurrencyKey, true);
            return this.createERC20Contract(quoteTknAddress);
        }
        return null;
    }
    get oneInchApiUrl() {
        return `https://api.1inch.io/v5.0/${this.sdk.context.isL2 ? 10 : 1}/`;
    }
    getOneInchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals) {
        return {
            fromTokenAddress: quoteTokenAddress,
            toTokenAddress: baseTokenAddress,
            amount: (0, wei_1.wei)(amount, decimals).toString(0, true),
        };
    }
    getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = this.getOneInchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, quoteDecimals);
            const res = yield axios_1.default.get(this.oneInchApiUrl + 'swap', {
                params: {
                    fromTokenAddress: params.fromTokenAddress,
                    toTokenAddress: params.toTokenAddress,
                    amount: params.amount,
                    fromAddress: this.sdk.context.walletAddress,
                    slippage: exchange_2.DEFAULT_1INCH_SLIPPAGE,
                    PROTOCOLS: exchange_2.PROTOCOLS,
                    referrerAddress: exchange_2.KWENTA_REFERRAL_ADDRESS,
                    disableEstimate: true,
                },
            });
            return res.data;
        });
    }
    quoteOneInch(quoteTokenAddress, baseTokenAddress, amount, decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = this.getOneInchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals);
            const response = yield axios_1.default.get(this.oneInchApiUrl + 'quote', {
                params: {
                    fromTokenAddress: params.fromTokenAddress,
                    toTokenAddress: params.toTokenAddress,
                    amount: params.amount,
                    disableEstimate: true,
                    PROTOCOLS: exchange_2.PROTOCOLS,
                },
            });
            return ethers_1.ethers.utils
                .formatUnits(response.data.toTokenAmount, response.data.toToken.decimals)
                .toString();
        });
    }
    swapSynthSwapGasEstimate(fromToken, toToken, fromAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.swapSynthSwap(fromToken, toToken, fromAmount, 'estimate_gas');
        });
    }
    getPairRates(quoteCurrencyKey, baseCurrencyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey)
                ? yield Promise.all([
                    this.getAtomicRates(quoteCurrencyKey),
                    this.getAtomicRates(baseCurrencyKey),
                ])
                : this.getExchangeRatesTupleForCurrencies(this.sdk.prices.currentPrices.onChain, quoteCurrencyKey, baseCurrencyKey);
        });
    }
    getOneInchApproveAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.oneInchApiUrl + 'approve/spender');
            return response.data.address;
        });
    }
    getGasEstimateForExchange(txProvider, quoteCurrencyKey, baseCurrencyKey, quoteAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.isL2)
                return null;
            const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
            const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
            const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey);
            if (txProvider === 'synthswap') {
                const [gasEstimate, metaTx] = yield Promise.all([
                    this.swapSynthSwapGasEstimate(this.allTokensMap[quoteCurrencyKey], this.allTokensMap[baseCurrencyKey], quoteAmount),
                    this.swapSynthSwap(this.allTokensMap[quoteCurrencyKey], this.allTokensMap[baseCurrencyKey], quoteAmount, 'meta_tx'),
                ]);
                // @ts-ignore TODO: Fix types from metaTx
                const l1Fee = yield this.sdk.transactions.getOptimismLayerOneFees(Object.assign(Object.assign({}, metaTx), { gasPrice: 0, gasLimit: Number(gasEstimate) }));
                return { limit: (0, transactions_1.normalizeGasLimit)(Number(gasEstimate)), l1Fee };
            }
            else if (txProvider === '1inch') {
                const [estimate, metaTx] = yield Promise.all([
                    this.swapOneInchGasEstimate(quoteCurrencyTokenAddress, baseCurrencyTokenAddress, quoteAmount, quoteDecimals),
                    this.swapOneInchMeta(quoteCurrencyTokenAddress, baseCurrencyTokenAddress, quoteAmount, quoteDecimals),
                ]);
                const l1Fee = yield this.sdk.transactions.getOptimismLayerOneFees(Object.assign(Object.assign({}, metaTx), { gasPrice: 0, gasLimit: Number(estimate) }));
                return { limit: (0, transactions_1.normalizeGasLimit)(Number(estimate)), l1Fee };
            }
        });
    }
    isCurrencyETH(currencyKey) {
        return currencyKey === exchange_2.CRYPTO_CURRENCY_MAP.ETH;
    }
    getTokenAddress(currencyKey, coingecko) {
        if (currencyKey != null) {
            if (this.isCurrencyETH(currencyKey)) {
                return coingecko ? exchange_2.ETH_COINGECKO_ADDRESS : exchange_2.ETH_ADDRESS;
            }
            else {
                return (0, lodash_1.get)(this.allTokensMap, [currencyKey, 'address'], null);
            }
        }
        else {
            return null;
        }
    }
    getCoingeckoPricesForCurrencies(coingeckoPrices, baseAddress) {
        if (!coingeckoPrices || !baseAddress) {
            return (0, wei_1.wei)(0);
        }
        const base = (baseAddress === exchange_2.ETH_ADDRESS ? exchange_2.ETH_COINGECKO_ADDRESS : baseAddress).toLowerCase();
        if (!coingeckoPrices[base]) {
            return (0, wei_1.wei)(0);
        }
        return (0, wei_1.wei)(coingeckoPrices[base].usd);
    }
    getExchangeRatesForCurrencies(rates, base, quote) {
        base = exchange_2.ADDITIONAL_MARKETS.has(base) ? (0, exchange_1.synthToAsset)(base) : base;
        return !rates || !base || !quote || !rates[base] || !rates[quote]
            ? (0, wei_1.wei)(0)
            : rates[base].div(rates[quote]);
    }
    getExchangeRatesTupleForCurrencies(rates, base, quote) {
        base = exchange_2.ADDITIONAL_MARKETS.has(base) ? (0, exchange_1.synthToAsset)(base) : base;
        const baseRate = !rates || !base || !rates[base] ? (0, wei_1.wei)(0) : rates[base];
        const quoteRate = !rates || !quote || !rates[quote] ? (0, wei_1.wei)(0) : rates[quote];
        return [baseRate, quoteRate];
    }
    // TODO: This is temporary.
    // We should consider either having another service for this
    // It does not quite fit into the synths service.
    // One idea is to create a "tokens" service that handles everything
    // related to 1inch tokens.
    getTokenBalances(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.isMainnet)
                return {};
            const filteredTokens = this.tokenList.filter((t) => !exchange_2.FILTERED_TOKENS.includes(t.address.toLowerCase()));
            const symbols = filteredTokens.map((token) => token.symbol);
            const tokensMap = (0, lodash_1.keyBy)(filteredTokens, 'symbol');
            const calls = [];
            for (const { address, symbol } of filteredTokens) {
                if (symbol === exchange_2.CRYPTO_CURRENCY_MAP.ETH) {
                    calls.push(this.sdk.context.multicallProvider.getEthBalance(walletAddress));
                }
                else {
                    const tokenContract = new ethcall_1.Contract(address, ERC20_json_1.default);
                    calls.push(tokenContract.balanceOf(walletAddress));
                }
            }
            const data = (yield this.sdk.context.multicallProvider.all(calls));
            const tokenBalances = {};
            data.forEach((value, index) => {
                var _a;
                if (value.lte(0))
                    return;
                const token = tokensMap[symbols[index]];
                tokenBalances[symbols[index]] = {
                    balance: (0, wei_1.wei)(value, (_a = token.decimals) !== null && _a !== void 0 ? _a : 18),
                    token,
                };
            });
            return tokenBalances;
        });
    }
    createERC20Contract(tokenAddress) {
        return new ethers_1.ethers.Contract(tokenAddress, ERC20_json_1.default, this.sdk.context.provider);
    }
}
exports.default = ExchangeService;
