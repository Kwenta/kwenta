import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { SECONDS_PER_DAY } from './constants';
import { getFuturesEndpoint, newCalculateFundingRate } from './utils';
import { wei } from '@synthetixio/wei';
import { getDisplayAsset } from 'utils/futures';
import { FundingRate } from './types';


const useGetAverageFundingRateForMarket = (
	currencyKey: string | null,
	assetPrice: number | null,
	currentFundingRate: number | undefined,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.FundingRates(network.id, currencyKey || '', assetPrice, currentFundingRate),
		async () => {
			if (!currencyKey || !assetPrice) return null;
			const { contracts } = synthetixjs!;
			const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;
			if (!marketAddress) return null;
			const minTimestamp = Math.floor(Date.now() / 1000) - SECONDS_PER_DAY;

			try {
				const response: {string: FundingRate[]} = await request(
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
					.filter((value: FundingRate[]) => value.length > 0)
					.map((entry: FundingRate[]): FundingRate => entry[0])
					.sort((a: FundingRate, b: FundingRate) => a.timestamp - b.timestamp)

				return responseFilt && !!currentFundingRate
					? newCalculateFundingRate(
						minTimestamp,
						responseFilt,
						assetPrice,
						currentFundingRate
				  )
				: wei(0);
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!synthetixjs && !!currentFundingRate,
			...options,
		}
	);
};

export default useGetAverageFundingRateForMarket;
