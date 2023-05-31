import { wei } from '@synthetixio/wei';

import { CurrencyKey, FIAT_SYNTHS } from 'constants/currency';
import { ADDITIONAL_MARKETS } from 'sdk/constants/exchange';
import { FuturesMarketKey } from 'sdk/types/futures';
import { Price, Prices } from 'sdk/types/prices';

export const isFiatCurrency = (currencyKey: CurrencyKey) => FIAT_SYNTHS.has(currencyKey);

// TODO: replace this with a more robust logic (like checking the asset field)
export const synthToAsset = (currencyKey: CurrencyKey | FuturesMarketKey) => {
	return currencyKey.replace(/^(i|s)/, '');
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
