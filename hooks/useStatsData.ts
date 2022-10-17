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
	const { data: rawVolumeData } = useGetStatsVolumes();
	const { data: rawTradersData } = useGetFuturesTradersStats();

	const openInterestData = useMemo(() => {
		return futuresMarkets.map(({ asset, marketSize, price }) => {
			return {
				asset,
				openInterest: marketSize.mul(price).toNumber(),
			};
		});
	}, [futuresMarkets]);

	// filter data
	const volumeData = useMemo(() => {
		return rawVolumeData;
	}, [rawVolumeData, selectedTimeframe]);

	const tradersData = useMemo(() => {
		return rawTradersData;
	}, [rawTradersData, selectedTimeframe]);

	return {
		volumeData,
		tradersData,
		openInterestData,
		selectedTimeframe,
		setSelectedTimeframe,
	};
};

export default useStatsData;
