import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import useSynthetixQueries from '@synthetixio/queries';

import usePeriodStartSynthRateQuery from 'queries/rates/usePeriodStartSynthRateQuery';
import { CurrencyKey, Synths } from 'constants/currency';
import { PeriodLabel } from 'constants/period';

const useCombinedRates = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedChartPeriodLabel,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const { subgraph } = useSynthetixQueries();

	// TODO @DEV @MF test it
	const baseHistoricalRatesQuery = subgraph.useGetRateUpdates(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				synth: baseCurrencyKey,
			},
			orderBy: 'block',
			orderDirection: 'desc',
		},
		{
			currencyKey: true,
			rate: true,
		}
	);
	const quoteHistoricalRatesQuery = subgraph.useGetRateUpdates(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				synth: quoteCurrencyKey,
			},
			orderBy: 'block',
			orderDirection: 'desc',
		},
		{
			currencyKey: true,
			rate: true,
		}
	);

	const { data: baseInitialRate } = usePeriodStartSynthRateQuery(
		baseCurrencyKey,
		selectedChartPeriodLabel.period
	);
	const { data: quoteInitialRate } = usePeriodStartSynthRateQuery(
		quoteCurrencyKey,
		selectedChartPeriodLabel.period
	);

	/* 	console.log(
		baseHistoricalRatesQuery.data,
		quoteHistoricalRatesQuery.data,
		baseCurrencyKey,
		quoteCurrencyKey
	); */

	const baseChange = useMemo(() => {
		if (baseHistoricalRatesQuery.data) {
			return baseHistoricalRatesQuery.data[0]?.change;
		}
		return null;
	}, [baseHistoricalRatesQuery]);
	const quoteChange = useMemo(() => {
		if (quoteHistoricalRatesQuery.data) {
			return quoteHistoricalRatesQuery.data[0]?.change;
		}
		return null;
	}, [quoteHistoricalRatesQuery]);
	const baseRates = useMemo(() => {
		if (baseHistoricalRatesQuery.data) {
			return baseHistoricalRatesQuery.data[0]?.rate.toString();
		}
		return null;
	}, [baseHistoricalRatesQuery]);
	const quoteRates = useMemo(() => {
		if (quoteHistoricalRatesQuery.data) {
			return quoteHistoricalRatesQuery.data[0]?.rate;
		}
		return null;
	}, [quoteHistoricalRatesQuery]);
	const change = useMemo(() => (baseChange! ?? 1) - (quoteChange! ?? 1), [quoteChange, baseChange]);

	const baseNoData = false;
	/* 	baseHistoricalRatesQuery.isSuccess &&
		baseHistoricalRatesQuery.data &&
		baseHistoricalRatesQuery.data[0]?.rateUpdates?.length === 0; */
	const quoteNoData = false;
	/* 	quoteHistoricalRatesQuery.isSuccess &&
		quoteHistoricalRatesQuery.data &&
		quoteHistoricalRatesQuery.data.rateUpdates.length === 0; */
	const noData = baseNoData || quoteNoData;

	const changes = useMemo(() => {
		/* 		if (!(baseRates.length && quoteRates.length && baseInitialRate && quoteInitialRate)) return [];

		let allRates: {
			isBaseRate?: boolean;
			timestamp: number;
			rate: number;
		}[] = [];
		if (baseCurrencyKey !== Synths.sUSD) {
			allRates = allRates.concat(baseRates.map((r) => ({ ...r, isBaseRate: true })));
		}
		if (quoteCurrencyKey !== Synths.sUSD) {
			allRates = allRates.concat(quoteRates);
		}
		allRates = orderBy(allRates, 'timestamp');

		let prevBaseRate = baseInitialRate.rate;
		let prevQuoteRate = quoteInitialRate.rate;

		return allRates.reduce((changes, { isBaseRate, rate, timestamp }) => {
			let change: number = 0;
			if (isBaseRate) {
				change = rate / prevQuoteRate;
				prevBaseRate = rate;
			} else {
				change = prevBaseRate / rate;
				prevQuoteRate = rate;
			}
			return changes.concat({ timestamp, value: change });
		}, [] as { timestamp: number; value: number }[]); */
		return [];
	}, [baseRates, quoteRates, baseInitialRate, quoteInitialRate, baseCurrencyKey, quoteCurrencyKey]);

	const [low, high] = useMemo(() => {
		if (changes.length < 2) return [0, 0];
		const sortedChanges = orderBy(changes, 'value');
		return [0, sortedChanges.length - 1].map((index) => sortedChanges[index].value);
	}, [changes]);

	return {
		data: changes,
		change,
		noData,
		isLoadingRates: baseHistoricalRatesQuery.isLoading || quoteHistoricalRatesQuery.isLoading,
		low,
		high,
	};
};

export default useCombinedRates;
