import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import { PeriodLabel } from 'constants/period';

const useCandleSticksChartData = ({
	currencyKey,
	selectedChartPeriodLabel,
}: {
	currencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	// TODO @DEV @MF test it
	const { useCandlesticksQuery } = useSynthetixQueries();
	const query = useCandlesticksQuery(currencyKey, selectedChartPeriodLabel.period);
	const data = query.isSuccess && query.data ? query.data : [];
	const noData = query.isSuccess && query.data && data.length === 0;

	return {
		data,
		noData,
		isLoading: query.isLoading,
	};
};

export default useCandleSticksChartData;
