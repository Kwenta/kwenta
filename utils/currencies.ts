import memoizeOne from 'memoize-one';

import {
	CurrencyKey,
	SYNTHS_MAP,
	CRYPTO_CURRENCY_MAP,
	FIAT_CURRENCY_MAP,
	SYNTHS,
	FIAT_SYNTHS,
	CRYPTO_SYNTHS_BY_MC,
} from 'constants/currency';

export const isSynth = (currencyKey: CurrencyKey) => !!SYNTHS_MAP[currencyKey];
export const isCryptoCurrency = (currencyKey: CurrencyKey) => !!CRYPTO_CURRENCY_MAP[currencyKey];
export const isFiatCurrency = (currencyKey: CurrencyKey) => !!FIAT_CURRENCY_MAP[currencyKey];
export const toMarketPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
	`${baseCurrencyKey}-${quoteCurrencyKey}`;

// TODO: replace this with a more robust logic (like checking the asset field)
export const toInverseSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^s/i, 'i');
export const toStandardSynth = (currencyKey: CurrencyKey) => currencyKey.replace(/^i/i, 's');
export const synthToAsset = (currencyKey: CurrencyKey) => currencyKey.replace(/^(i|s)/i, '');

export const getAvailableMarketNames = memoizeOne(() => {
	const marketNames: Array<{
		baseCurrencyKey: CurrencyKey;
		quoteCurrencyKey: CurrencyKey;
		pair: string;
	}> = [];

	for (let i = 0; i < SYNTHS.length; i++) {
		const currencyA = SYNTHS[i];
		for (let j = 0; j < SYNTHS.length; j++) {
			const currencyB = SYNTHS[j];
			if (currencyA !== currencyB) {
				marketNames.push({
					baseCurrencyKey: currencyA,
					quoteCurrencyKey: currencyB,
					pair: toMarketPair(currencyA, currencyB),
				});
			}
		}
	}

	return marketNames;
});

export const getFilteredMarketNames = memoizeOne(
	(currencyKey: CurrencyKey, type: 'base' | 'quote') =>
		getAvailableMarketNames().filter((marketName) =>
			type === 'base'
				? marketName.baseCurrencyKey === currencyKey
				: marketName.quoteCurrencyKey === currencyKey
		)
);

export const getMarketPairByMC = memoizeOne(
	(baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) => {
		const marketPair = {
			base: baseCurrencyKey,
			quote: quoteCurrencyKey,
			reversed: false,
		};

		const marketPairReversed = {
			base: quoteCurrencyKey,
			quote: baseCurrencyKey,
			reversed: true,
		};

		// handle fiat first - it must always be the quote
		if (FIAT_SYNTHS.includes(quoteCurrencyKey)) {
			return marketPair;
		}
		if (FIAT_SYNTHS.includes(baseCurrencyKey)) {
			return marketPairReversed;
		}

		// set a really high rank for low MC coins
		const baseCurrencyKeyRank = CRYPTO_SYNTHS_BY_MC[baseCurrencyKey] || Number.MAX_SAFE_INTEGER;
		const quoteCurrencyKeyRank = CRYPTO_SYNTHS_BY_MC[quoteCurrencyKey] || Number.MAX_SAFE_INTEGER;

		// lower rank -> higher MC
		return quoteCurrencyKeyRank <= baseCurrencyKeyRank ? marketPair : marketPairReversed;
	}
);
