import Wei, { wei, WeiSource } from '@synthetixio/wei';

import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
} from 'constants/defaults';
import { CurrencyKey } from 'constants/currency';
import { isFiatCurrency } from 'utils/currencies';

export type FormatNumberOptions = {
	minDecimals?: number;
	maxDecimals?: number;
	prefix?: string;
	suffix?: string;
};

export type FormatCurrencyOptions = {
	minDecimals?: number;
	maxDecimals?: number;
	sign?: string;
	currencyKey?: string;
};

const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CRYPTO_CURRENCY_DECIMALS = 4;
export const LONG_CRYPTO_CURRENCY_DECIMALS = 8;

export const getDecimalPlaces = (value: WeiSource) => (value.toString().split('.')[1] || '').length;

export const zeroBN = wei(0);

// TODO: implement max decimals
export const formatNumber = (value: WeiSource, options?: FormatNumberOptions) => {
	const prefix = options?.prefix;
	const suffix = options?.suffix;

	let weiValue = wei(0);
	try {
		weiValue = wei(value);
	} catch {}

	const formattedValue = [];
	if (prefix) {
		formattedValue.push(prefix);
	}

	formattedValue.push(weiValue.toString(options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS));
	if (suffix) {
		formattedValue.push(` ${suffix}`);
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
	});

export const formatCurrency = (
	currencyKey: string,
	value: WeiSource,
	options?: FormatCurrencyOptions
) =>
	isFiatCurrency(currencyKey as CurrencyKey)
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options);

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
