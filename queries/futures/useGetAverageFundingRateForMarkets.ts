import Wei, { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { fundingRatesState, futuresMarketsState } from 'store/futures';
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
	asset: FuturesMarketKey;
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
	const setFundingRates = useSetRecoilState(fundingRatesState);

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

	return useQuery<any>(
		QUERY_KEYS.Futures.FundingRates(network.id, periodLength),
		async () => {
			const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;

			const fundingRatePromises = fundingRateInputs.map(
				({ marketAddress, marketKey, price, currentFundingRate }) => {
					try {
						const response = request(
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
						).then((response: { string: FundingRateUpdate[] }): FundingRateResponse | null => {
							if (!price) return null;
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
						});
						return response;
					} catch (e) {
						logError(e);
						return null;
					}
				}
			);

			const fundingRateResponses = await Promise.all(fundingRatePromises);
			const fundingRates: FundingRateResponse[] = fundingRateResponses.filter(
				(funding): funding is FundingRateResponse => !!funding
			);

			setFundingRates(fundingRates);
		},
		{
			enabled: isAppReady && isL2 && futuresMarkets.length > 0,
			...options,
		}
	);
};

export default useGetAverageFundingRateForMarkets;
