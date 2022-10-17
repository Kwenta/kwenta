import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetFuturesTradesStats } from 'queries/futures/useGetFuturesTradesStats';
import { useGetFuturesVolumesStats } from 'queries/futures/useGetFuturesVolumesStats';
import { futuresMarketsState } from 'store/futures';
import { selectedTimeframeState } from 'store/stats';

export type StatsTimeframe = '1M' | '1Y' | 'MAX';

const useStatsData = () => {
	const [selectedTimeframe, setSelectedTimeframe] = useRecoilState(selectedTimeframeState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	// run queries
	useGetFuturesMarkets();
	const { data: rawVolumeData } = useGetFuturesVolumesStats();
	const { data: rawTradesData } = useGetFuturesTradesStats();
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

	const tradesData = useMemo(() => {
		return rawTradesData;
	}, [rawTradesData, selectedTimeframe]);

	const tradersData = useMemo(() => {
		return rawTradersData;
	}, [rawTradersData, selectedTimeframe]);

	return {
		volumeData,
		tradesData,
		tradersData,
		openInterestData,
		selectedTimeframe,
		setSelectedTimeframe,
	};
};

export default useStatsData;
