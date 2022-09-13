import Wei, { wei } from '@synthetixio/wei';
import BN from 'bn.js';
import { BigNumber, ethers, utils } from 'ethers';

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
	truncation?: {
		unit: string;
		divisor: number;
	};
};

export type FormatNumberOptions = {
	minDecimals?: number;
	maxDecimals?: number;
	prefix?: string;
	suffix?: string;
} & TruncatedOptions;

export type FormatCurrencyOptions = {
	minDecimals?: number;
	maxDecimals?: number;
	sign?: string;
	currencyKey?: string;
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
 * This helper is used to reverse this behavior in order to display the specified decmials in the output.
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
	const truncation = options?.truncation;

	let weiValue = wei(0);
	try {
		weiValue = wei(value);
	} catch (e) {
		logError(`***Error in formatNumber ${e}`);
	}

	const isNegative = weiValue.lt(wei(0));
	const formattedValue = [];
	if (isNegative) {
		formattedValue.push('-');
	}
	if (prefix) {
		formattedValue.push(prefix);
	}

	let weiAsStringWithDecimals = truncation
		? weiValue
				.abs()
				.div(truncation.divisor)
				.toString(options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS)
		: weiValue.abs().toString(options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS);

	if (options?.maxDecimals || options?.maxDecimals === 0) {
		weiAsStringWithDecimals = wei(weiAsStringWithDecimals).toString(options.maxDecimals);
	}

	const withCommas = commifyAndPadDecimals(
		weiAsStringWithDecimals,
		options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS
	);

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
	});

export const formatFiatCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_FIAT_DECIMALS,
		maxDecimals: options?.maxDecimals,
		truncation: options?.truncation,
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
	return wei(weiAmount, 18, true);
};

export const suggestedDecimals = (value: WeiSource) => {
	value = wei(value).toNumber();
	if (value >= 10000) return 0;
	if (value >= 1) return 2;
	if (value >= 0.01) return 3;
	if (value >= 0.001) return 4;
	return 5;
};

export const floorNumber = (num: WeiSource, decimals?: number) => {
	const precision = 10 ** (decimals ?? suggestedDecimals(num));
	return Math.floor(Number(num) * precision) / precision;
};
