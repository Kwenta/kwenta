import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';
import { PeriodLabel } from 'constants/period';

const useAreaChartData = ({
	currencyKey,
	selectedChartPeriodLabel,
}: {
	currencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const { useCandlesticksQuery, subgraph } = useSynthetixQueries();
	const candleQuery = useCandlesticksQuery(currencyKey, selectedChartPeriodLabel.period);
	const ratesQuery = subgraph.useGetRateUpdates({}, { rate: true, timestamp: true });

	const candlesData = candleQuery.data?.length ? candleQuery.data : [];

	const change = candleQuery.data?.length
		? wei(candleQuery.data[0].open)
				.sub(candleQuery.data[0].close)
				.div(candleQuery.data[0].open)
				.toNumber()
		: null;

	const rates = ratesQuery.data?.length
		? ratesQuery.data.map((rate) => ({
				rate: rate.rate.toNumber(),
				timestamp: rate.timestamp.toNumber(),
		  }))
		: [];

	const noData =
		candleQuery.isSuccess && !!candleQuery.data.length && ratesQuery.data?.length === 0;

	return {
		noData,
		change,
		rates,
		candlesData,
		isLoading: candleQuery.isLoading || ratesQuery.isLoading,
	};
};

export default useAreaChartData;
