import { useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetStatsVolumes } from 'queries/futures/useGetStatsVolumes';
import { usePollMarkets } from 'state/futures/hooks';
import { selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectedTimeframeState } from 'store/stats';

export type StatsTimeframe = '1M' | '1Y' | 'MAX';

const useStatsData = () => {
	const [selectedTimeframe, setSelectedTimeframe] = useRecoilState(selectedTimeframeState);
	const futuresMarkets = useAppSelector(selectMarkets);
	usePollMarkets();

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
