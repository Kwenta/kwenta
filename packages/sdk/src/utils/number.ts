import { BigNumber } from '@ethersproject/bignumber'
import Wei, { wei } from '@synthetixio/wei'
import { ethers, utils } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
	UNIT_BIG_NUM,
	ZERO_WEI,
} from '../constants/number'

import { isFiatCurrency } from './exchange'
import { FuturesMarketAsset } from '../types'

export type TruncateUnits = 1e3 | 1e6 | 1e9 | 1e12

type WeiSource = Wei | number | string | ethers.BigNumber

type TruncatedOptions = {
	truncateOver?: TruncateUnits
	truncation?: {
		// Maybe remove manual truncation params
		unit: string
		divisor: number
		decimals: number
	}
}

const thresholds = [
	{ value: 1e12, divisor: 1e12, unit: 'T', decimals: 2 },
	{ value: 1e9, divisor: 1e9, unit: 'B', decimals: 2 },
	{ value: 1e6, divisor: 1e6, unit: 'M', decimals: 2 },
	{ value: 1e3, divisor: 1e3, unit: 'K', decimals: 0 },
]

export type FormatNumberOptions = {
	minDecimals?: number
	maxDecimals?: number
	prefix?: string
	suffix?: string
	suggestDecimals?: boolean
	suggestDecimalsForAsset?: FuturesMarketAsset
} & TruncatedOptions

export type FormatCurrencyOptions = {
	minDecimals?: number
	maxDecimals?: number
	sign?: string
	currencyKey?: string
	suggestDecimals?: boolean
	suggestDecimalsForAsset?: FuturesMarketAsset
} & TruncatedOptions

export const SHORT_CRYPTO_CURRENCY_DECIMALS = 4
export const LONG_CRYPTO_CURRENCY_DECIMALS = 8

export const getDecimalPlaces = (value: WeiSource) => (value.toString().split('.')[1] || '').length

export const truncateNumbers = (value: WeiSource, maxDecimalDigits: number) => {
	if (value.toString().includes('.')) {
		const parts = value.toString().split('.')
		return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits)
	}
	return value.toString()
}

const DecimalsForAsset: Partial<Record<FuturesMarketAsset, number>> = {
	[FuturesMarketAsset.STETHETH]: 8,
}

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
	let formatted = utils.commify(value)
	const comps = formatted.split('.')
	if (!decimals) return comps[0]

	if (comps.length === 2 && comps[1].length !== decimals) {
		const zeros = '0'.repeat(decimals - comps[1].length)
		const decimalSuffix = `${comps[1]}${zeros}`
		formatted = `${comps[0]}.${decimalSuffix}`
	}
	return formatted
}

const getDecimalsForFormatting = (value: Wei, options?: FormatNumberOptions) => {
	if (options?.truncation) return options?.truncation.decimals
	if (options?.suggestDecimalsForAsset) {
		const decimals = DecimalsForAsset[options.suggestDecimalsForAsset]
		return decimals ?? suggestedDecimals(value)
	}
	if (options?.suggestDecimals) return suggestedDecimals(value)
	return options?.minDecimals ?? DEFAULT_NUMBER_DECIMALS
}

export const formatNumber = (value: WeiSource, options?: FormatNumberOptions) => {
	const prefix = options?.prefix
	const suffix = options?.suffix
	const truncateThreshold = options?.truncateOver ?? 0
	let truncation = options?.truncation

	let weiValue = wei(0)
	try {
		weiValue = wei(value)
	} catch (e) {
		// eslint-disable-next-line
		console.error(e)
	}

	const isNegative = weiValue.lt(wei(0))
	const formattedValue = []
	if (isNegative) {
		formattedValue.push('-')
	}
	if (prefix) {
		formattedValue.push(prefix)
	}

	// specified truncation params overrides universal truncate
	truncation =
		truncateThreshold && !truncation
			? thresholds.find(
					(threshold) => weiValue.gte(threshold.value) && weiValue.gte(truncateThreshold)
			  )
			: truncation

	const weiBeforeAsString = truncation ? weiValue.abs().div(truncation.divisor) : weiValue.abs()

	const defaultDecimals = getDecimalsForFormatting(weiBeforeAsString, { ...options, truncation })

	const decimals = options?.maxDecimals
		? Math.min(defaultDecimals, options.maxDecimals)
		: defaultDecimals

	const withCommas = commifyAndPadDecimals(weiBeforeAsString.toString(decimals), decimals)

	formattedValue.push(withCommas)

	if (truncation) {
		formattedValue.push(truncation.unit)
	}

	if (suffix) {
		formattedValue.push(` ${suffix}`)
	}

	return formattedValue.join('')
}

export const formatCryptoCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_CRYPTO_DECIMALS,
		...options,
	})

export const formatFiatCurrency = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatNumber(value, {
		...options,
		prefix: options?.sign,
		suffix: options?.currencyKey,
		minDecimals: options?.minDecimals ?? DEFAULT_FIAT_DECIMALS,
	})

export const formatCurrency = (
	currencyKey: string,
	value: WeiSource,
	options?: FormatCurrencyOptions
) =>
	isFiatCurrency(currencyKey)
		? formatFiatCurrency(value, options)
		: formatCryptoCurrency(value, options)

export const formatDollars = (value: WeiSource, options?: FormatCurrencyOptions) =>
	formatCurrency('sUSD', value, { sign: '$', ...options })

export const formatPercent = (
	value: WeiSource,
	options?: { minDecimals?: number; suggestDecimals?: boolean; maxDecimals?: number }
) => {
	let decimals = options?.suggestDecimals ? suggestedDecimals(value) : options?.minDecimals ?? 2
	if (options?.maxDecimals) {
		decimals = Math.min(decimals, options.maxDecimals)
	}
	if (options?.minDecimals) {
		decimals = Math.max(decimals, options.minDecimals)
	}
	return `${wei(value).mul(100).toString(decimals)}%`
}

export function scale(input: Wei, decimalPlaces: number): Wei {
	return input.mul(wei(10).pow(decimalPlaces))
}

export const formatGwei = (wei: number) => wei / 1e8 / 10

export const divideDecimal = (x: BigNumber, y: BigNumber) => {
	return x.mul(UNIT_BIG_NUM).div(y)
}

export const multiplyDecimal = (x: BigNumber, y: BigNumber) => {
	return x.mul(y).div(UNIT_BIG_NUM)
}

export const weiFromWei = (weiAmount: WeiSource) => {
	if (weiAmount instanceof Wei) {
		const precisionDiff = 18 - weiAmount.p
		return wei(weiAmount, 18, true).div(10 ** precisionDiff)
	} else {
		return wei(weiAmount, 18, true)
	}
}

export const suggestedDecimals = (value: WeiSource) => {
	value = wei(value).abs().toNumber()
	if (value >= 100000) return 0
	if (value >= 100 || value === 0) return 2
	if (value >= 10) return 3
	if (value >= 0.1) return 4
	if (value >= 0.01) return 5
	if (value >= 0.001) return 6
	if (value >= 0.0001) return 7
	if (value >= 0.00001) return 8
	return 11
}

export const floorNumber = (num: WeiSource, decimals?: number) => {
	const precision = 10 ** (decimals ?? suggestedDecimals(num))
	return Math.floor(Number(num) * precision) / precision
}

export const ceilNumber = (num: WeiSource, decimals?: number) => {
	const precision = 10 ** (decimals ?? suggestedDecimals(num))
	return Math.ceil(Number(num) * precision) / precision
}

// Converts to string but strips trailing zeros
export const weiToString = (weiVal: Wei) => {
	return String(parseFloat(weiVal.toString()))
}

export const isZero = (num: WeiSource) => {
	return wei(num || 0).eq(0)
}

export const weiFromEth = (num: WeiSource) => wei(num).toBN().toString()

export const gweiToWei = (val: WeiSource) => {
	return parseUnits(wei(val).toString(), 9).toString()
}

export const toWei = (value?: string | null, p?: number) => {
	return !!value ? wei(value, p) : ZERO_WEI
}

export const stripZeros = (value?: string | number) => {
	if (!value) return ''
	return String(value).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
}
