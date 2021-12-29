import Wei, { wei } from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';
import { Query } from 'react-query';

import { BaseRateUpdate } from '@synthetixio/queries';

// The function turns react query cached queries into a map (with the currencyKey) as the key to be used in the sorting.
export const toCurrencyKeyMap = (
	query: Query<unknown, unknown>[],
	dataField?: string
): Partial<Record<CurrencyKey, number>> =>
	query.reduce((acc, query) => {
		// the fourth item is the currencyKey (according to the queryKeys.ts file)
		const currencyKey = query.queryKey[3] as string;

		if (query.state.data != null) {
			// @ts-ignore
			acc[currencyKey] = dataField ? query.state.data[dataField] : query.state.data;
		}

		return acc;
	}, {});

export const numericSort = (
	comparatorMap: Partial<Record<CurrencyKey, Wei | number | string>>,
	a: CurrencyKey,
	b: CurrencyKey
) => {
	const valA = wei(comparatorMap[a] ?? 0);
	const valB = wei(comparatorMap[b] ?? 0);

	return valA.gt(valB) ? -1 : 1;
};

export const usdHistoricalRates = (
	periodInHours: number,
	rate = 1,
	points = 100
): BaseRateUpdate[] => {
	let now = Date.now();

	const rates = [];

	for (let i = 0; i < points; i++) {
		rates.unshift({
			timestamp: now,
			rate,
		});
		now -= 1000 * 60 * periodInHours;
	}

	return rates;
};

export const calculateRateChange = (
	rates: any // : RateUpdate[]
) => {
	if (rates.length < 2) return 0;

	const newPrice = rates[0].rate;
	const oldPrice = rates[rates.length - 1].rate;
	const percentageChange = (newPrice - oldPrice) / oldPrice;

	return percentageChange;
};
