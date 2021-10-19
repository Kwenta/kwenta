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
	const { useHistoricalRatesQuery } = useSynthetixQueries();

	const baseHistoricalRates = useHistoricalRatesQuery(
		baseCurrencyKey,
		selectedChartPeriodLabel.period,
		{
			refetchInterval: 60000,
		}
	);
	const quoteHistoricalRates = useHistoricalRatesQuery(
		quoteCurrencyKey,
		selectedChartPeriodLabel.period,
		{
			refetchInterval: 60000,
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

	const baseChange = useMemo(() => baseHistoricalRates.data?.change ?? null, [baseHistoricalRates]);
	const quoteChange = useMemo(() => quoteHistoricalRates.data?.change ?? null, [
		quoteHistoricalRates,
	]);
	const baseRates = useMemo(() => baseHistoricalRates.data?.rates ?? [], [baseHistoricalRates]);
	const quoteRates = useMemo(() => quoteHistoricalRates.data?.rates ?? [], [quoteHistoricalRates]);
	const change = useMemo(() => (baseChange! ?? 1) - (quoteChange! ?? 1), [quoteChange, baseChange]);

	const baseNoData =
		baseHistoricalRates.isSuccess &&
		baseHistoricalRates.data &&
		baseHistoricalRates.data.rates.length === 0;
	const quoteNoData =
		quoteHistoricalRates.isSuccess &&
		quoteHistoricalRates.data &&
		quoteHistoricalRates.data.rates.length === 0;
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
		isLoadingRates: baseHistoricalRates.isLoading || quoteHistoricalRates.isLoading,
		low,
		high,
	};
};

export default useCombinedRates;
