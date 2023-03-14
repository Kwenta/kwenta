import Wei, { wei } from '@synthetixio/wei';

import {
	CurrencyKey,
	CRYPTO_CURRENCY_MAP,
	FIAT_SYNTHS,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { FuturesMarketKey } from 'sdk/types/futures';
import { Price, Prices } from 'sdk/types/prices';

import { PriceResponse } from '../queries/coingecko/types';

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

type Rates = Record<string, Wei>;

const ADDITIONAL_MARKETS = new Set<string>([
	FuturesMarketKey.sAPEPERP,
	FuturesMarketKey.sDYDXPERP,
	FuturesMarketKey.sXAUPERP,
	FuturesMarketKey.sXAGPERP,
]);

export const getExchangeRatesForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey | FuturesMarketKey | string,
	quote: CurrencyKey | FuturesMarketKey | null
) => {
	base = ADDITIONAL_MARKETS.has(base) ? synthToAsset(base) : base;
	return !rates || !base || !quote || !rates[base] || !rates[quote]
		? wei(0)
		: rates[base].div(rates[quote]);
};

export const getPricesForCurrencies = (
	rates: Prices | null,
	base: CurrencyKey | FuturesMarketKey | string,
	quote: CurrencyKey | FuturesMarketKey | null
): Price => {
	base = ADDITIONAL_MARKETS.has(base) ? synthToAsset(base) : base;
	if (!rates || !base || !quote || !rates[base] || !rates[quote]) {
		return { offChain: wei(0), onChain: wei(0) };
	}

	const hasOnChain = !!rates[base]?.onChain && !!rates[quote]?.onChain;
	const hasOffChain = !!rates[base]?.offChain && !!rates[quote]?.offChain;

	return {
		onChain: hasOnChain ? rates[base].onChain!.div(rates[quote].onChain!) : wei(0),
		offChain: hasOffChain ? rates[base].offChain!.div(rates[quote].offChain!) : wei(0),
	};
};

export const getExchangeRatesTupleForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey | FuturesMarketKey | string,
	quote: CurrencyKey | FuturesMarketKey | null
) => {
	base = ADDITIONAL_MARKETS.has(base) ? synthToAsset(base) : base;
	const baseRate = !rates || !base || !rates[base] ? wei(0) : rates[base];
	const quoteRate = !rates || !quote || !rates[quote] ? wei(0) : rates[quote];

	return [baseRate, quoteRate];
};

export const newGetCoinGeckoPricesForCurrencies = (
	coinGeckoPrices: PriceResponse | null,
	baseAddress: string | null
) => {
	if (!coinGeckoPrices || !baseAddress) {
		return wei(0);
	}
	const base = (baseAddress === ETH_ADDRESS ? ETH_COINGECKO_ADDRESS : baseAddress).toLowerCase();

	if (!coinGeckoPrices[base]) {
		return wei(0);
	}

	return wei(coinGeckoPrices[base].usd);
};

export const getCurrencyKeyURLPath = (currencyKey: CurrencyKey) =>
	`https:///www.synthetix.io/assets/synths/svg/${currencyKey}.svg`;
