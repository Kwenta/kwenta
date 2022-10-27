import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetStatsVolumes } from 'queries/futures/useGetStatsVolumes';
import { futuresMarketsState } from 'store/futures';
import { selectedTimeframeState } from 'store/stats';

export type StatsTimeframe = '1M' | '1Y' | 'MAX';

const useStatsData = () => {
	const [selectedTimeframe, setSelectedTimeframe] = useRecoilState(selectedTimeframeState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	// run queries
	useGetFuturesMarkets();
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
		selectedTimeframe,
		setSelectedTimeframe,
	};
};

export default useStatsData;
