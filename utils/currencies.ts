import { Rates, Token } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import {
	CurrencyKey,
	Synths,
	CRYPTO_CURRENCY_MAP,
	FIAT_SYNTHS,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { FuturesMarketKey } from 'sdk/types/futures';
import { Price, Prices } from 'sdk/types/prices';

import { PriceResponse } from '../queries/coingecko/types';

export const isSynth = (currencyKey: CurrencyKey) => !!Synths[currencyKey];
export const isCryptoCurrency = (currencyKey: CurrencyKey) => !!CRYPTO_CURRENCY_MAP[currencyKey];
export const isFiatCurrency = (currencyKey: CurrencyKey) => FIAT_SYNTHS.has(currencyKey);

// TODO: replace this with a more robust logic (like checking the asset field)
export const toInverseSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^s/i, 'i');
export const toStandardSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^i/i, 's');
export const synthToAsset = (currencyKey: CurrencyKey | FuturesMarketKey) => {
	return currencyKey.replace(/^(i|s)/, '');
};
export const assetToSynth = (currencyKey: CurrencyKey) => `s${currencyKey}`;
export const iStandardSynth = (currencyKey: CurrencyKey) => currencyKey.startsWith('s');
export const synthToContractName = (currencyKey: CurrencyKey) => `Synth${currencyKey}`;

export const getExchangeRatesForCurrencies = (
	rates: Rates | null | undefined,
	base: string | null | undefined,
	quote: string | null | undefined
) =>
	rates == null ||
	base == null ||
	quote == null ||
	rates[base] === undefined ||
	rates[quote] === undefined
		? 0
		: rates[base].toNumber() * (1 / rates[quote].toNumber());

export const newGetExchangeRatesForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey | FuturesMarketKey | string | null,
	quote: CurrencyKey | FuturesMarketKey | null
) => {
	base = new Set([
		FuturesMarketKey.sAPEPERP,
		FuturesMarketKey.sDYDXPERP,
		FuturesMarketKey.sXAUPERP,
		FuturesMarketKey.sXAGPERP,
	]).has(base as FuturesMarketKey)
		? synthToAsset(base as CurrencyKey)
		: base;
	return rates == null ||
		base == null ||
		quote == null ||
		rates[base] === undefined ||
		rates[quote] === undefined
		? wei(0)
		: rates[base].div(rates[quote]);
};

export const getPricesForCurrencies = (
	rates: Prices | null,
	base: CurrencyKey | FuturesMarketKey | string | null,
	quote: CurrencyKey | FuturesMarketKey | null
): Price => {
	base = new Set([
		FuturesMarketKey.sAPEPERP,
		FuturesMarketKey.sDYDXPERP,
		FuturesMarketKey.sXAUPERP,
		FuturesMarketKey.sXAGPERP,
	]).has(base as FuturesMarketKey)
		? synthToAsset(base as CurrencyKey)
		: base;
	if (!rates || !base || !quote || !rates[base] || !rates[quote]) {
		return {
			offChain: wei(0),
			onChain: wei(0),
		};
	}
	const hasOnChain = !!rates[base]?.onChain && !!rates[quote]?.onChain;
	const hasOffChain = !!rates[base]?.offChain && !!rates[quote]?.offChain;

	return {
		onChain: hasOnChain ? rates[base].onChain!.div(rates[quote].onChain!) : wei(0),
		offChain: hasOffChain ? rates[base].offChain!.div(rates[quote].offChain!) : wei(0),
	};
};

export const newGetExchangeRatesTupleForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey | FuturesMarketKey | string | null,
	quote: CurrencyKey | FuturesMarketKey | null
) => {
	base = new Set([
		FuturesMarketKey.sAPEPERP,
		FuturesMarketKey.sDYDXPERP,
		FuturesMarketKey.sXAUPERP,
		FuturesMarketKey.sXAGPERP,
	]).has(base as FuturesMarketKey)
		? synthToAsset(base as CurrencyKey)
		: base;
	const baseRate =
		rates == null || base == null || rates[base] === undefined ? wei(0) : rates[base];
	const quoteRate =
		rates == null || quote == null || rates[quote] === undefined ? wei(0) : rates[quote];

	return [baseRate, quoteRate];
};

export const newGetCoinGeckoPricesForCurrencies = (
	coinGeckoPrices: PriceResponse | null,
	baseCurrencyTokenAddress: Token['address'] | null
) => {
	if (!coinGeckoPrices || !baseCurrencyTokenAddress) {
		return wei(0);
	}
	const base = (baseCurrencyTokenAddress === ETH_ADDRESS
		? ETH_COINGECKO_ADDRESS
		: baseCurrencyTokenAddress
	).toLowerCase();

	if (!coinGeckoPrices[base]) {
		return wei(0);
	}

	return wei(coinGeckoPrices[base].usd);
};

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
	`https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;
