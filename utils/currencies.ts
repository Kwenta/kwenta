import { Rates } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import { CurrencyKey, Synths, CRYPTO_CURRENCY_MAP, FIAT_SYNTHS } from 'constants/currency';

import { FuturesMarketKey } from './futures';

export const isSynth = (currencyKey: CurrencyKey) => !!Synths[currencyKey];
export const isCryptoCurrency = (currencyKey: CurrencyKey) => !!CRYPTO_CURRENCY_MAP[currencyKey];
export const isFiatCurrency = (currencyKey: CurrencyKey) => FIAT_SYNTHS.has(currencyKey);

// TODO: replace this with a more robust logic (like checking the asset field)
export const toInverseSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^s/i, 'i');
export const toStandardSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^i/i, 's');
export const synthToAsset = (currencyKey: CurrencyKey) => currencyKey.replace(/^(i|s)/, '');
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
		FuturesMarketKey.sAPE,
		FuturesMarketKey.sDYDX,
		FuturesMarketKey.sXAU,
		FuturesMarketKey.sXAG,
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

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
	`https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;
