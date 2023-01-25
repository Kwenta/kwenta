import { useMemo } from 'react';

import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetStatsVolumes } from 'queries/futures/useGetStatsVolumes';
import { selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

export type StatsTimeframe = '1M' | '1Y' | 'MAX';

const useStatsData = () => {
	const futuresMarkets = useAppSelector(selectMarkets);

	const { data: volumeData, isLoading: volumeIsLoading } = useGetStatsVolumes();
	const { data: tradersData, isLoading: tradersIsLoading } = useGetFuturesTradersStats();

	const openInterestData = useMemo(() => {
		return futuresMarkets.map(({ asset, marketSize, price }) => {
			return {
				asset,
				openInterest: marketSize.mul(price).toNumber(),
			};
		});
	}, [futuresMarkets]);

	return {
		volumeData,
		volumeIsLoading,
		tradersData,
		tradersIsLoading,
		openInterestData,
	};
};

export default useStatsData;
