import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Synths: {
		HistoricalRates: (currencyKey: CurrencyKey, period: Period) => [
			'synths',
			'historicalRates',
			currencyKey,
			period,
		],
	},
};

export default QUERY_KEYS;
