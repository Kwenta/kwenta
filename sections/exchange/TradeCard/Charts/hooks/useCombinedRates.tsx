import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import useSynthetixQueries from '@synthetixio/queries';

import usePeriodStartSynthRateQuery from 'queries/rates/usePeriodStartSynthRateQuery';
import { CurrencyKey, Synths } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import { calculateTimestampForPeriod } from 'utils/formatters/date';

import { PERIOD_IN_HOURS } from 'constants/period';

const useCombinedRates = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedChartPeriodLabel,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const timestamp_gte = calculateTimestampForPeriod(
		PERIOD_IN_HOURS[selectedChartPeriodLabel.period]
	);

	// return {
	// 	data: [],
	// 	change: 0,
	// 	noData: true,
	// 	isLoadingRates: false, //baseHistoricalRatesQuery.isLoading || quoteHistoricalRates.isLoading,
	// 	low: 0,
	// 	high: 0,
	// };
	// const { useHistoricalRatesQuery } = useSynthetixQueries();
	const { exchanges } = useSynthetixQueries();

	const baseHistoricalRatesQuery = exchanges.useGetRateUpdates(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				timestamp_gte,
				synth: baseCurrencyKey,
			},
		},
		{
			id: true,
			currencyKey: true,
			synth: true,
			rate: true,
			block: true,
			timestamp: true,
		}
	);

	const quoteHistoricalRatesQuery = exchanges.useGetRateUpdates(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				timestamp_gte,
				synth: quoteCurrencyKey,
			},
		},
		{
			id: true,
			currencyKey: true,
			synth: true,
			rate: true,
			block: true,
			timestamp: true,
		}
	);

	// const baseHistoricalRates = useHistoricalRatesQuery(
	// 	baseCurrencyKey,
	// 	selectedChartPeriodLabel.period
	// );
	// const quoteHistoricalRates = useHistoricalRatesQuery(
	// 	quoteCurrencyKey,
	// 	selectedChartPeriodLabel.period
	// );

	const { data: baseInitialRate } = usePeriodStartSynthRateQuery(
		baseCurrencyKey,
		selectedChartPeriodLabel.period
	);
	const { data: quoteInitialRate } = usePeriodStartSynthRateQuery(
		quoteCurrencyKey,
		selectedChartPeriodLabel.period
	);

	const baseChange = useMemo(() => baseHistoricalRatesQuery.data?.change ?? null, [baseHistoricalRatesQuery]);
	const quoteChange = useMemo(() => quoteHistoricalRatesQuery.data?.change ?? null, [
		quoteHistoricalRatesQuery,
	]);
	const baseRates = useMemo(() => baseHistoricalRatesQuery.data?.rates ?? [], [baseHistoricalRatesQuery]);
	const quoteRates = useMemo(() => quoteHistoricalRatesQuery.data?.rates ?? [], [quoteHistoricalRatesQuery]);
	const change = useMemo(() => (baseChange! ?? 1) - (quoteChange! ?? 1), [quoteChange, baseChange]);

	const baseNoData =
		baseHistoricalRatesQuery.isSuccess &&
		baseHistoricalRatesQuery.data &&
		baseHistoricalRatesQuery.data.rateUpdates.length === 0;
	const quoteNoData =
		quoteHistoricalRatesQuery.isSuccess &&
		quoteHistoricalRatesQuery.data &&
		quoteHistoricalRatesQuery.data.rateUpdates.length === 0;
	const noData = baseNoData || quoteNoData;

	const changes = useMemo(() => {
		if (!(baseRates.length && quoteRates.length && baseInitialRate && quoteInitialRate)) return [];

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
		}, [] as { timestamp: number; value: number }[]);
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
