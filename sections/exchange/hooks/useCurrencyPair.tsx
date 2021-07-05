import { useState } from 'react';

import { LOCAL_STORAGE_KEYS } from 'constants/storage';

import useLocalStorage from 'hooks/useLocalStorage';

type CurrencyPairProps<T> = {
	persistSelectedCurrencies: boolean;
	defaultBaseCurrencyKey: T | null;
	defaultQuoteCurrencyKey: T | null;
};

const useCurrencyPair = function <T>({
	persistSelectedCurrencies = false,
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
}: CurrencyPairProps<T>) {
	const currencyPairLocalStorage = useLocalStorage<{
		base: T | null;
		quote: T | null;
	}>(LOCAL_STORAGE_KEYS.SELECTED_MARKET, {
		base: defaultBaseCurrencyKey,
		quote: defaultQuoteCurrencyKey,
	});

	const currencyPair = useState<{
		base: T | null;
		quote: T | null;
	}>({
		base: defaultBaseCurrencyKey,
		quote: defaultQuoteCurrencyKey,
	});

	return persistSelectedCurrencies ? currencyPairLocalStorage : currencyPair;
};

export default useCurrencyPair;
