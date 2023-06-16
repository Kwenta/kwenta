import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
export type TruncateUnits = 1e3 | 1e6 | 1e9 | 1e12;
type WeiSource = Wei | number | string | ethers.BigNumber;
type TruncatedOptions = {
    truncateOver?: TruncateUnits;
    truncation?: {
        unit: string;
        divisor: number;
        decimals: number;
    };
};
export type FormatNumberOptions = {
    minDecimals?: number;
    maxDecimals?: number;
    prefix?: string;
    suffix?: string;
    suggestDecimals?: boolean;
} & TruncatedOptions;
export type FormatCurrencyOptions = {
    minDecimals?: number;
    maxDecimals?: number;
    sign?: string;
    currencyKey?: string;
    suggestDecimals?: boolean;
} & TruncatedOptions;
export declare const SHORT_CRYPTO_CURRENCY_DECIMALS = 4;
export declare const LONG_CRYPTO_CURRENCY_DECIMALS = 8;
export declare const getDecimalPlaces: (value: WeiSource) => number;
export declare const truncateNumbers: (value: WeiSource, maxDecimalDigits: number) => string;
/**
 * ethers utils.commify method will reduce the decimals of a number to one digit if those decimals are zero.
 * This helper is used to reverse this behavior in order to display the specified decimals in the output.
 *
 * ex: utils.commify('10000', 2) => '10,000.0'
 * ex: commifyAndPadDecimals('10000', 2)) => '10,000.00'
 * @param value - commified value from utils.commify
 * @param decimals - number of decimals to display on commified value.
 * @returns string
 */
export declare const commifyAndPadDecimals: (value: string, decimals: number) => string;
export declare const formatNumber: (value: WeiSource, options?: FormatNumberOptions) => string;
export declare const formatCryptoCurrency: (value: WeiSource, options?: FormatCurrencyOptions) => string;
export declare const formatFiatCurrency: (value: WeiSource, options?: FormatCurrencyOptions) => string;
export declare const formatCurrency: (currencyKey: string, value: WeiSource, options?: FormatCurrencyOptions) => string;
export declare const formatDollars: (value: WeiSource, options?: FormatCurrencyOptions) => string;
export declare const formatPercent: (value: WeiSource, options?: {
    minDecimals: number;
}) => string;
export declare function scale(input: Wei, decimalPlaces: number): Wei;
export declare const formatGwei: (wei: number) => number;
export declare const divideDecimal: (x: BigNumber, y: BigNumber) => ethers.BigNumber;
export declare const multiplyDecimal: (x: BigNumber, y: BigNumber) => ethers.BigNumber;
export declare const weiFromWei: (weiAmount: WeiSource) => Wei;
export declare const suggestedDecimals: (value: WeiSource) => 5 | 0 | 2 | 3 | 4 | 6 | 7 | 8;
export declare const floorNumber: (num: WeiSource, decimals?: number) => number;
export declare const ceilNumber: (num: WeiSource, decimals?: number) => number;
export declare const weiToString: (weiVal: Wei) => string;
export declare const isZero: (num: WeiSource) => boolean;
export declare const weiFromEth: (num: WeiSource) => string;
export declare const gweiToWei: (val: WeiSource) => string;
export declare const toWei: (value?: string | null, p?: number) => Wei;
export declare const stripZeros: (value?: string | number) => string;
export {};
