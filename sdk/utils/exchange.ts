import { CurrencyKey } from 'sdk/types/common';
import { FuturesMarketKey } from 'sdk/types/futures';

export const synthToAsset = (currencyKey: CurrencyKey | FuturesMarketKey) => {
	return currencyKey.replace(/^(i|s)/, '');
};
