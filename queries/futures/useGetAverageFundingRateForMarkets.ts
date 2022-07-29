import Wei, { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useQueries, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { futuresMarketsState } from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import { FuturesMarketKey, MarketKeyByAsset } from 'utils/futures';
import logError from 'utils/logError';

import { FundingRateUpdate } from './types';
import { getFuturesEndpoint, calculateFundingRate } from './utils';

type FundingRateInput = {
	marketAddress: string | undefined;
	marketKey: FuturesMarketKey;
	price: Wei | undefined;
	currentFundingRate: Wei | undefined;
};

export type FundingRateResponse = {
	asset: string;
	fundingRate: Wei | null;
};

const useGetAverageFundingRateForMarkets = (
	periodLength: number,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const futuresEndpoint = getFuturesEndpoint(network);

	const fundingRateInputs: FundingRateInput[] = futuresMarkets.map(
		({ asset, market, price, currentFundingRate }) => {
			return {
				marketAddress: market,
				marketKey: MarketKeyByAsset[asset],
				price: price,
				currentFundingRate: currentFundingRate,
			};
		}
	);

	return useQueries(
		fundingRateInputs.map(({ marketAddress, marketKey, price, currentFundingRate }) => {
			return {
				queryKey: QUERY_KEYS.Futures.FundingRate(network.id, marketKey || ''),
				queryFn: async () => {
					if (!marketKey || !price || !marketAddress) return null;
					const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;
					try {
						const response: { string: FundingRateUpdate[] } = await request(
							futuresEndpoint,
							gql`
								query fundingRateUpdates($market: String!, $minTimestamp: BigInt!) {
									# last before timestamp
									first: fundingRateUpdates(
										first: 1
										where: { market: $market, timestamp_lt: $minTimestamp }
										orderBy: sequenceLength
										orderDirection: desc
									) {
										timestamp
										funding
									}

									# first after timestamp
									next: fundingRateUpdates(
										first: 1
										where: { market: $market, timestamp_gt: $minTimestamp }
										orderBy: sequenceLength
										orderDirection: asc
									) {
										timestamp
										funding
									}

									# latest update
									latest: fundingRateUpdates(
										first: 1
										where: { market: $market }
										orderBy: sequenceLength
										orderDirection: desc
									) {
										timestamp
										funding
									}
								}
							`,
							{ market: marketAddress, minTimestamp: minTimestamp }
						);
						const responseFilt = Object.values(response)
							.filter((value: FundingRateUpdate[]) => value.length > 0)
							.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
							.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp);

						const fundingRateResponse: FundingRateResponse = {
							asset: marketKey,
							fundingRate:
								responseFilt && !!currentFundingRate
									? calculateFundingRate(
											minTimestamp,
											periodLength,
											responseFilt,
											price,
											currentFundingRate
									  )
									: wei(0),
						};
						return fundingRateResponse;
					} catch (e) {
						logError(e);
						return null;
					}
				},
				enabled: isAppReady && isL2 && !!futuresMarkets,
				...options,
			};
		})
	);
};

export default useGetAverageFundingRateForMarkets;
