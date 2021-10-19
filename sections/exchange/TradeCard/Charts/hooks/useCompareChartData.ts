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

	const baseRates = useMemo(() => baseHistoricalRates.data?.rates ?? [], [baseHistoricalRates]);
	const quoteRates = useMemo(() => quoteHistoricalRates.data?.rates ?? [], [quoteHistoricalRates]);

	const baseNoData =
		baseHistoricalRates.isSuccess &&
		baseHistoricalRates.data &&
		baseHistoricalRates.data.rates.length === 0;
	const quoteNoData =
		quoteHistoricalRates.isSuccess &&
		quoteHistoricalRates.data &&
		quoteHistoricalRates.data.rates.length === 0;
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
		isLoadingRates: baseHistoricalRates.isLoading || quoteHistoricalRates.isLoading,
	};
};

export default useCombinedRates;
