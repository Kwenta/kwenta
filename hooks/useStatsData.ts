import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import { useGetFuturesTradesStats } from 'queries/futures/useGetFuturesTradesStats';
import { useGetFuturesVolumesStats } from 'queries/futures/useGetFuturesVolumesStats';
import { futuresMarketsState } from 'store/futures';

const useStatsData = () => {
	useGetFuturesMarkets();
	const { data: volumeData } = useGetFuturesVolumesStats();
	const { data: tradersData } = useGetFuturesTradersStats();
	const { data: tradesData } = useGetFuturesTradesStats();

	const futuresMarkets = useRecoilValue(futuresMarketsState);

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
		tradesData,
		tradersData,
		openInterestData,
		futuresMarkets,
	};
};

export default useStatsData;
