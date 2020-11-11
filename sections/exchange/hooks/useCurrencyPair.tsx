import { useState } from 'react';

import { CurrencyKey } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

import useLocalStorage from 'hooks/useLocalStorage';

type CurrencyPairProps = {
	persistSelectedCurrencies: boolean;
	defaultBaseCurrencyKey: CurrencyKey | null;
	defaultQuoteCurrencyKey: CurrencyKey | null;
};

const useCurrencyPair = ({
	persistSelectedCurrencies = false,
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
}: CurrencyPairProps) => {
	const currencyPairLocalStorage = useLocalStorage<{
		base: CurrencyKey | null;
		quote: CurrencyKey | null;
	}>(LOCAL_STORAGE_KEYS.SELECTED_MARKET, {
		base: defaultBaseCurrencyKey,
		quote: defaultQuoteCurrencyKey,
	});

	const currencyPair = useState<{
		base: CurrencyKey | null;
		quote: CurrencyKey | null;
	}>({
		base: defaultBaseCurrencyKey,
		quote: defaultQuoteCurrencyKey,
	});

	return persistSelectedCurrencies ? currencyPairLocalStorage : currencyPair;
};

export default useCurrencyPair;
