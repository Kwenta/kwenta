import { useMemo } from 'react';

import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetStatsVolumes } from 'queries/futures/useGetStatsVolumes';
import { selectMarketPrice, selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

export type StatsTimeframe = '1M' | '1Y' | 'MAX';

const useStatsData = () => {
	const futuresMarkets = useAppSelector(selectMarkets);
	const price = useAppSelector(selectMarketPrice);

	const { data: volumeData, isLoading: volumeIsLoading } = useGetStatsVolumes();
	const { data: tradersData, isLoading: tradersIsLoading } = useGetFuturesTradersStats();

	const openInterestData = useMemo(() => {
		return futuresMarkets.map(({ asset, marketSize }) => {
			return {
				asset,
				openInterest: marketSize.mul(price).toNumber(),
			};
		});
	}, [futuresMarkets, price]);

	return {
		volumeData,
		volumeIsLoading,
		tradersData,
		tradersIsLoading,
		openInterestData,
	};
};

export default useStatsData;
