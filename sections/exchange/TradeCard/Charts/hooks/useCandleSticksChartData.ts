import { CurrencyKey } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import useCandlesticksQuery from 'queries/rates/useCandlesticksQuery';

const useCandleSticksChartData = ({
	currencyKey,
	selectedChartPeriodLabel,
}: {
	currencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
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
