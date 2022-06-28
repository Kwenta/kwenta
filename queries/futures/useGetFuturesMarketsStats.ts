import React from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';
// import { utils as ethersUtils } from 'ethers';
import _ from 'lodash';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
// import { calculateTimestampForPeriod } from 'utils/formatters/date';
// import { DAY_PERIOD } from './constants';
// import { calculateTradeVolume, getFuturesEndpoint } from './utils';
// import { getFuturesTrades } from './subgraph';
import useGetFuturesMarkets from './useGetFuturesMarkets';
import Connector from 'containers/Connector';
import { zeroBN } from 'utils/formatters/number';
import { getMarketKey } from 'utils/futures';
import { Rates } from 'queries/rates/types';

type FuturesStats = {
	volume: Wei;
	trades: number;
	openInterest: Wei;
};

const useGetFuturesStats = (options?: UseQueryOptions<FuturesStats | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	// const futuresEndpoint = getFuturesEndpoint(network);
	const futuresMarketsQuery = useGetFuturesMarkets();
	// const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const { synthetixjs } = Connector.useContainer();

	const futureRates = futuresMarketsQuery.isSuccess
		? futuresMarketsQuery?.data?.reduce((acc: Rates, { asset, price }) => {
				const currencyKey = getMarketKey(asset, network.id);
				acc[currencyKey] = price;
				return acc;
		  }, {})
		: null;

	const basePriceRate = React.useCallback(
		(marketAsset: string) =>
			_.defaultTo(Number(futureRates?.[getMarketKey(marketAsset, network.id)]), 0),
		[futureRates, network.id]
	);

	return useQuery<FuturesStats | null>(
		QUERY_KEYS.Futures.OverviewStats(network.id),
		async () => {
			if (!synthetixjs) return null;
			try {
				// Compute open interests
				const {
					contracts: { FuturesMarketData },
				} = synthetixjs;

				const summaries: any[] = await FuturesMarketData.allMarketSummaries();

				const openInterest = summaries.reduce((acc, summary) => {
					return acc.add(summary.marketSize.mul(wei(basePriceRate(summary.asset))));
				}, zeroBN);

				return { openInterest, trades: 0, volume: zeroBN };
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesStats;
