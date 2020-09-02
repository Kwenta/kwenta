import {
	CurrencyKey,
	SYNTHS_MAP,
	CRYPTO_CURRENCY_MAP,
	FIAT_CURRENCY_MAP,
} from 'constants/currency';

export const isSynth = (currencyKey: CurrencyKey) => !!SYNTHS_MAP[currencyKey];
export const isCryptoCurrency = (currencyKey: CurrencyKey) => !!CRYPTO_CURRENCY_MAP[currencyKey];
export const isFiatCurrency = (currencyKey: CurrencyKey) => !!FIAT_CURRENCY_MAP[currencyKey];

// TODO: replace this with a more robust logic (like checking the asset field)
export const toInverseSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^s/i, 'i');
export const toStandardSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^i/i, 's');
export const synthToAsset = (currencyKey: CurrencyKey) => currencyKey.replace(/^(i|s)/i, '');

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
	`https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;
