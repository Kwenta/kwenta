import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';

import usePeriodStartSynthRateQuery from 'queries/rates/usePeriodStartSynthRateQuery';
import { CurrencyKey, Synths } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';

const useCombinedRates = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedPeriod,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedPeriod: PeriodLabel;
}) => {
	const network = useRecoilValue(networkState);

	const {
		useHistoricalRatesQuery
	} = useSynthetixQueries({
		networkId: network.id
	});

	const baseHistoricalRates = useHistoricalRatesQuery(baseCurrencyKey, selectedPeriod.period);
	const quoteHistoricalRates = useHistoricalRatesQuery(quoteCurrencyKey, selectedPeriod.period);

	const { data: baseInitialRate } = usePeriodStartSynthRateQuery(
		baseCurrencyKey,
		selectedPeriod.period
	);
	const { data: quoteInitialRate } = usePeriodStartSynthRateQuery(
		quoteCurrencyKey,
		selectedPeriod.period
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
			return changes.concat({ timestamp, change });
		}, [] as { timestamp: number; change: number }[]);
	}, [baseRates, quoteRates, baseInitialRate, quoteInitialRate, baseCurrencyKey, quoteCurrencyKey]);

	const [low, high] = useMemo(() => {
		if (changes.length < 2) return [0, 0];
		const sortedChanges = orderBy(changes, 'change');
		return [0, sortedChanges.length - 1].map((index) => sortedChanges[index].change);
	}, [changes]);

	return {
		changes,
		change,
		noData,
		isLoadingRates: baseHistoricalRates.isLoading || quoteHistoricalRates.isLoading,
		low,
		high,
	};
};

export default useCombinedRates;
