/// <reference types="lodash" />
import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import KwentaSDK from '..';
import { SynthSuspensionReason } from '../types/futures';
import { DeprecatedSynthBalance } from '../types/synths';
import { Token, TokenBalances } from '../types/tokens';
import { SynthSymbol } from '../data/synths';
import { PriceResponse } from '../types/exchange';
export default class ExchangeService {
    private tokensMap;
    private tokenList;
    private allTokensMap;
    private sdk;
    constructor(sdk: KwentaSDK);
    get exchangeRates(): Partial<Record<import("../types/prices").AssetKey, Wei>>;
    getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string): "synthetix" | "1inch" | "synthswap" | undefined;
    getTradePrices(txProvider: ReturnType<ExchangeService['getTxProvider']>, quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmountWei: Wei, baseAmountWei: Wei): Promise<{
        quoteTradePrice: Wei;
        baseTradePrice: Wei;
    }>;
    getSlippagePercent(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmountWei: Wei, baseAmountWei: Wei): Promise<Wei | undefined>;
    getBaseFeeRate(baseCurrencyKey: string, quoteCurrencyKey: string): Promise<Wei>;
    getExchangeFeeRate(quoteCurrencyKey: string, baseCurrencyKey: string): Promise<Wei>;
    getRate(baseCurrencyKey: string, quoteCurrencyKey: string): Promise<Wei>;
    getOneInchTokenList(): Promise<{
        tokens: {
            chainId: 1 | 10;
            tags: never[];
            symbol: string;
            name: string;
            address: string;
            decimals: number;
            logoURI: string;
        }[];
        tokensMap: import("lodash").Dictionary<{
            chainId: 1 | 10;
            tags: never[];
            symbol: string;
            name: string;
            address: string;
            decimals: number;
            logoURI: string;
        }>;
        symbols: string[];
    }>;
    getFeeReclaimPeriod(currencyKey: string): Promise<number>;
    swapSynthSwap(fromToken: Token, toToken: Token, fromAmount: string, metaOnly?: 'meta_tx' | 'estimate_gas'): Promise<ethers.BigNumber | ethers.providers.TransactionResponse | ethers.PopulatedTransaction>;
    swapOneInchMeta(quoteTokenAddress: string, baseTokenAddress: string, amount: string, quoteDecimals: number): Promise<ethers.providers.TransactionRequest>;
    swapOneInch(quoteTokenAddress: string, baseTokenAddress: string, amount: string, quoteDecimals: number): Promise<ethers.providers.TransactionResponse>;
    swapOneInchGasEstimate(quoteTokenAddress: string, baseTokenAddress: string, amount: string, quoteDecimals: number): Promise<number>;
    getNumEntries(currencyKey: string): Promise<number>;
    getAtomicRates(currencyKey: string): Promise<Wei>;
    approveSwap(quoteCurrencyKey: string, baseCurrencyKey: string): Promise<string | undefined>;
    handleSettle(baseCurrencyKey: string): Promise<string | undefined>;
    handleExchange(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string, baseAmount: string): Promise<string | undefined>;
    getTransactionFee(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string, baseAmount: string): Promise<Wei | null>;
    getFeeCost(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string): Promise<Wei>;
    getApproveAddress(txProvider: ReturnType<ExchangeService['getTxProvider']>): Promise<string> | "0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6";
    checkAllowance(quoteCurrencyKey: string, baseCurrencyKey: string): Promise<Wei | undefined>;
    getCurrencyName(currencyKey: string): string | undefined;
    getOneInchQuote(baseCurrencyKey: string, quoteCurrencyKey: string, amount: string): Promise<string>;
    getPriceRate(currencyKey: string, txProvider: ReturnType<ExchangeService['getTxProvider']>, coinGeckoPrices: PriceResponse): Promise<Wei>;
    getRedeemableDeprecatedSynths(): Promise<{
        balances: DeprecatedSynthBalance[];
        totalUSDBalance: Wei;
    }>;
    validCurrencyKeys(quoteCurrencyKey?: string, baseCurrencyKey?: string): boolean[];
    getCoingeckoPrices(quoteCurrencyKey: string, baseCurrencyKey: string): Promise<PriceResponse>;
    batchGetCoingeckoPrices(tokenAddresses: string[], include24hrChange?: boolean): Promise<PriceResponse>;
    private get sUSDRate();
    private getExchangeParams;
    getSynthsMap(): Partial<Record<SynthSymbol, import("../data/synths").SynthToken>>;
    get synthsMap(): Partial<Record<SynthSymbol, import("../data/synths").SynthToken>>;
    getOneInchTokens(): Promise<{
        tokensMap: any;
        tokenList: Token[];
    }>;
    getSynthSuspensions(): Promise<Record<string, {
        isSuspended: boolean;
        reasonCode: number;
        reason: SynthSuspensionReason | null;
    }>>;
    private checkIsAtomic;
    private getTokenDecimals;
    private getQuoteCurrencyContract;
    private get oneInchApiUrl();
    private getOneInchQuoteSwapParams;
    private getOneInchSwapParams;
    private quoteOneInch;
    private swapSynthSwapGasEstimate;
    private getPairRates;
    private getOneInchApproveAddress;
    private getGasEstimateForExchange;
    private isCurrencyETH;
    private getTokenAddress;
    private getCoingeckoPricesForCurrencies;
    private getExchangeRatesForCurrencies;
    private getExchangeRatesTupleForCurrencies;
    getTokenBalances(walletAddress: string): Promise<TokenBalances>;
    private createERC20Contract;
}
