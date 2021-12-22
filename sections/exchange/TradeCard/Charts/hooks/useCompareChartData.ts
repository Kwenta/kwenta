import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import useSynthetixQueries from '@synthetixio/queries';

import usePeriodStartSynthRateQuery from 'queries/rates/usePeriodStartSynthRateQuery';
import { CurrencyKey, Synths } from 'constants/currency';
import { PeriodLabel, PERIOD_IN_HOURS } from 'constants/period';

import { calculateTimestampForPeriod } from 'utils/formatters/date';

const useCombinedRates = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedChartPeriodLabel,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	// TODO @DEV @MF test it
	const { subgraph } = useSynthetixQueries();
	const period = PERIOD_IN_HOURS[selectedChartPeriodLabel.period];

	const baseHistoricalRatesQuery = !baseCurrencyKey
		? { isSuccess: false, data: [], isLoading: false }
		: subgraph.useGetRateUpdates(
				{
					first: Number.MAX_SAFE_INTEGER,
					where: {
						timestamp_gte: calculateTimestampForPeriod(period),
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

	// const baseHistoricalRatesQuery = useMemo(() => {

	// }, [baseCurrencyKey])

	const quoteHistoricalRatesQuery = !quoteCurrencyKey
		? { isSuccess: false, data: [], isLoading: false }
		: subgraph.useGetRateUpdates(
				{
					first: Number.MAX_SAFE_INTEGER,
					where: {
						timestamp_gte: calculateTimestampForPeriod(period),
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

	const { data: baseInitialRate } = usePeriodStartSynthRateQuery(
		baseCurrencyKey,
		selectedChartPeriodLabel.period
	);
	const { data: quoteInitialRate } = usePeriodStartSynthRateQuery(
		quoteCurrencyKey,
		selectedChartPeriodLabel.period
	);

	const baseRates = useMemo(() => baseHistoricalRatesQuery.data ?? [], [baseHistoricalRatesQuery]);
	const quoteRates = useMemo(() => quoteHistoricalRatesQuery.data ?? [], [
		quoteHistoricalRatesQuery,
	]);

	const baseNoData =
		baseHistoricalRatesQuery.isSuccess &&
		baseHistoricalRatesQuery.data &&
		baseHistoricalRatesQuery.data.length === 0;
	const quoteNoData =
		quoteHistoricalRatesQuery.isSuccess &&
		quoteHistoricalRatesQuery.data &&
		quoteHistoricalRatesQuery.data.length === 0;
	const noData = baseNoData || quoteNoData;

	const data = useMemo(() => {
		if (!(baseRates.length && quoteRates.length && baseInitialRate && quoteInitialRate)) return [];

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

		return allRates.reduce((chartData, { isBaseRate, rate, timestamp }) => {
			let baseRate: number = 0;
			let quoteRate: number = 0;

			if (isBaseRate) {
				baseRate = prevBaseRate = rate;
				quoteRate = prevQuoteRate;
			} else {
				quoteRate = prevQuoteRate = rate;
				baseRate = prevBaseRate;
			}
			return chartData.concat({ timestamp, baseRate, quoteRate });
		}, [] as { timestamp: number; baseRate: number; quoteRate: number }[]);
	}, [baseRates, quoteRates, baseInitialRate, quoteInitialRate, baseCurrencyKey, quoteCurrencyKey]);

	return {
		data,
		noData,
		isLoadingRates: baseHistoricalRatesQuery.isLoading || quoteHistoricalRatesQuery.isLoading,
	};
};

export default useCombinedRates;
