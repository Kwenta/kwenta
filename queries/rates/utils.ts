import subHours from 'date-fns/subHours';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import { RateUpdates, BaseRateUpdates, BaseRateUpdate } from './types';

export const getMinAndMaxRate = (rates: RateUpdates) => {
	if (rates.length === 0) return [0, 0];

	return rates.reduce(
		([minRate, maxRate], val) => {
			const { rate } = val;
			const newMax = rate > maxRate ? rate : maxRate;
			const newMin = rate < minRate ? rate : minRate;

			return [newMin, newMax];
		},
		[Number.MAX_SAFE_INTEGER, 0]
	);
};

const matchRates = (ratesA: RateUpdates, ratesB: RateUpdates, isQuote: boolean) => {
	const rates: BaseRateUpdates = [];
	// For each base rate (USD)
	ratesA.forEach((rateA) => {
		// We search what was the quote rate in USD
		// prior (or same time) the base rate ticker
		const matchRate = ratesB.find((rateB) => {
			return rateB.timestamp <= rateA.timestamp;
		});
		// if one is found, we do rate = base / quote
		// and push it to the rates array
		if (matchRate) {
			rates.push({
				rate: isQuote ? matchRate.rate / rateA.rate : rateA.rate / matchRate.rate,
				timestamp: rateA.timestamp,
			});
		}
	});

	return rates;
};

export const calculateRateChange = (rates: RateUpdates) => {
	if (rates.length < 2) return 0;

	const newPrice = rates[0].rate;
	const oldPrice = rates[rates.length - 1].rate;
	const percentageChange = (newPrice - oldPrice) / oldPrice;

	return percentageChange;
};

export const matchPairRates = (baseRates: RateUpdates, quoteRates: RateUpdates) => {
	if (!baseRates || baseRates.length === 0 || !quoteRates || quoteRates.length === 0) {
		return [];
	}
	const rates = [
		...matchRates(baseRates, quoteRates, false),
		...matchRates(quoteRates, baseRates, true),
	];

	return orderBy(uniqBy(rates, 'timestamp'), 'timestamp', ['desc']);
};

export const calculateTimestampForPeriod = (periodInHours: number) =>
	Math.trunc(subHours(new Date().getTime(), periodInHours).getTime() / 1000);

export const mockHistoricalRates = (
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
