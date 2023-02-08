import Wei, { wei } from '@synthetixio/wei';
import BN from 'bn.js';
import { BigNumber, ethers, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { CurrencyKey } from 'constants/currency';
import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
} from 'constants/defaults';
import { isFiatCurrency } from 'utils/currencies';
import logError from 'utils/logError';

type WeiSource = Wei | number | string | ethers.BigNumber;

type TruncatedOptions = {
	truncate?: boolean;
	truncation?: {
		// Maybe remove manual truncation params
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
	isAssetPrice?: boolean;
} & TruncatedOptions;

export type FormatCurrencyOptions = {
	minDecimals?: number;
	maxDecimals?: number;
	sign?: string;
	currencyKey?: string;
	isAssetPrice?: boolean;
} & TruncatedOptions;

const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CRYPTO_CURRENCY_DECIMALS = 4;
export const LONG_CRYPTO_CURRENCY_DECIMALS = 8;

export const getDecimalPlaces = (value: WeiSource) => (value.toString().split('.')[1] || '').length;

export const zeroBN = wei(0);

export const UNIT_BN = new BN('10').pow(new BN(18));
export const UNIT_BIG_NUM = BigNumber.from('10').pow(18);
export const ZERO_BIG_NUM = BigNumber.from('0');

export const truncateNumbers = (value: WeiSource, maxDecimalDigits: number) => {
	if (value.toString().includes('.')) {
		const parts = value.toString().split('.');
		return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits);
	}
	return value.toString();
};

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
export const commifyAndPadDecimals = (value: string, decimals: number) => {
	let formatted = utils.commify(value);
	const comps = formatted.split('.');

	if (comps.length === 2 && comps[1].length !== decimals) {
		const zeros = '0'.repeat(decimals - comps[1].length);

		const decimalSuffix = `${comps[1]}${zeros}`;
		formatted = `${comps[0]}.${decimalSuffix}`;
	}

	return formatted;
};

// TODO: implement max decimals
export const formatNumber = (value: WeiSource, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;
	const shouldTruncate = options?.truncate;
	const isAssetPrice = options?.isAssetPrice;
	let truncation = options?.truncation;

	let weiValue = wei(0);
	try {
		weiValue = wei(value);
	} catch (e) {
		logError(e);
	}

	const isNegative = weiValue.lt(wei(0));
	const formattedValue = [];
	if (isNegative) {
		formattedValue.push('-');
	}
	if (prefix) {
		formattedValue.push(prefix);
	}

	// specified truncation params overrides universal truncate
	if (shouldTruncate && !truncation) {
		if (weiValue.gt(1e6)) {
			truncation = { divisor: 1e6, unit: 'M', decimals: 2 };
		} else if (weiValue.gt(1e3)) {
			truncation = { divisor: 1e3, unit: 'K', decimals: 0 };
		}
	}

	const weiBeforeAsString = truncation ? weiValue.abs().div(truncation.divisor) : weiValue.abs();

	const decimals = truncation
		? truncation.decimals
		: isAssetPrice
		? suggestedDecimals(weiBeforeAsString)
		: options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS;

	let weiAsStringWithDecimals = weiBeforeAsString.toString(decimals);

	if (options?.maxDecimals || options?.maxDecimals === 0) {
		weiAsStringWithDecimals = wei(weiAsStringWithDecimals).toString(options.maxDecimals);
	}

	const withCommas = commifyAndPadDecimals(weiAsStringWithDecimals, decimals);

	formattedValue.push(withCommas);

	if (suffix) {
		formattedValue.push(` ${suffix}`);
	}

	if (truncation) {
		formattedValue.push(truncation.unit);
	}

	return formattedValue.join('');
};

export const formatCryptoCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_CRYPTO_DECIMALS,
		maxDecimals: options?.maxDecimals,
		isAssetPrice: options?.isAssetPrice,
	});

export const formatFiatCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		...options,
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_FIAT_DECIMALS,
	});

export const formatCurrency = (
	currencyKey: string,
	value: WeiSource,
	options?: FormatCurrencyOptions
) =>
	isFiatCurrency(currencyKey as CurrencyKey)
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options);

export const formatDollars = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatCurrency('sUSD', value, { sign: '$', ...options });

export const formatPercent = (value: WeiSource, options?: { minDecimals: number }) => {
	const decimals = options?.minDecimals ?? 2;

	return `${wei(value).mul(100).toString(decimals)}%`;
};

// TODO: figure out a robust way to get the correct precision.
const getPrecision = (amount: WeiSource) => {
	if (amount >= 1) {
		return DEFAULT_CURRENCY_DECIMALS;
	}
	if (amount > 0.01) {
		return SHORT_CRYPTO_CURRENCY_DECIMALS;
	}
	return LONG_CRYPTO_CURRENCY_DECIMALS;
};

// TODO: use a library for this, because the sign does not always appear on the left. (perhaps something like number.toLocaleString)
export const formatCurrencyWithSign = (
	sign: string | null | undefined,
	value: WeiSource,
	decimals?: number
) => `${sign}${formatCurrency(String(value), decimals || getPrecision(value))}`;

export const formatCurrencyWithKey = (
	currencyKey: CurrencyKey,
	value: WeiSource,
	decimals?: number
) => `${formatCurrency(String(value), decimals || getPrecision(value))} ${currencyKey}`;

export function scale(input: Wei, decimalPlaces: number): Wei {
	return input.mul(wei(10).pow(decimalPlaces));
}

export const formatGwei = (wei: number) => wei / 1e8 / 10;

export const divideDecimal = (x: BigNumber, y: BigNumber) => {
	return x.mul(UNIT_BIG_NUM).div(y);
};

export const multiplyDecimal = (x: BigNumber, y: BigNumber) => {
	return x.mul(y).div(UNIT_BIG_NUM);
};

export const weiFromWei = (weiAmount: WeiSource) => {
	if (weiAmount instanceof Wei) {
		const precisionDiff = 18 - weiAmount.p;
		return wei(weiAmount, 18, true).div(10 ** precisionDiff);
	} else {
		return wei(weiAmount, 18, true);
	}
};

export const suggestedDecimals = (value: WeiSource) => {
	value = wei(value).toNumber();
	if (value >= 10000) return 0;
	if (value >= 10 || value === 0) return 2;
	if (value >= 0.1) return 4;
	if (value >= 0.01) return 5;
	return 6;
};

export const floorNumber = (num: WeiSource, decimals?: number) => {
	const precision = 10 ** (decimals ?? suggestedDecimals(num));
	return Math.floor(Number(num) * precision) / precision;
};

export const ceilNumber = (num: WeiSource, decimals?: number) => {
	const precision = 10 ** (decimals ?? suggestedDecimals(num));
	return Math.ceil(Number(num) * precision) / precision;
};

// Converts to string but strips trailing zeros
export const weiToString = (weiVal: Wei) => {
	return String(parseFloat(weiVal.toString()));
};

export const isZero = (num: WeiSource) => {
	return wei(num || 0).eq(0);
};

export const weiFromEth = (num: WeiSource) => wei(num).toBN().toString();

export const gweiToWei = (val: WeiSource) => {
	return parseUnits(wei(val).toString(), 9).toString();
};

export const toWei = (value?: string | null, p?: number) => {
	return !!value ? wei(value, p) : zeroBN;
};

export const stipZeros = (value?: string | number) => {
	return String(parseFloat(String(value)));
};
