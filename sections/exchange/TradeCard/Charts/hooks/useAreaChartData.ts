import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import { PeriodLabel } from 'constants/period';

const useAreaChartData = ({
	currencyKey,
	selectedChartPeriodLabel,
}: {
	currencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const { useCandlesticksQuery } = useSynthetixQueries();
	const data = useCandlesticksQuery(currencyKey, selectedChartPeriodLabel.period);
	// TODO @DEV @MF test it and calculate rate
	const change = data.data[0].open ?? null;
	// eslint-disable-next-line
	const rates = data.data?.rates ?? [];

	const noData = data.isSuccess && data.data && data.data.rates.length === 0;

	return {
		noData,
		change,
		rates,
		isLoading: data.isLoading,
	};
};

export default useAreaChartData;
