import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT, SECONDS_PER_DAY } from './constants';
import { mapFuturesPosition } from './utils';
import Wei, { wei } from '@synthetixio/wei';

const useGetAverageFundingRate = (
	currencyKey: string | null,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<any | null>(
		QUERY_KEYS.Futures.FundingRate(currencyKey || ''),
		async () => {
			if (!currencyKey) return null;
			const { contracts } = synthetixjs!;
			const marketAddress = contracts[`FuturesMarket${currencyKey.slice(1)}`].address;
			if (!marketAddress) return null;
			const minTimestamp = Math.floor(Date.now() / 1000) - SECONDS_PER_DAY
			console.log(marketAddress)
			console.log(minTimestamp)

			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query fundingRateUpdates($market: String!, $minTimestamp: BigInt!) {
							fundingRateUpdates(
								where: {
									market: $market,
									timestamp_gt: $minTimestamp
								}
								orderBy: sequenceLength
								orderDirection: asc
							) {
								timestamp
								fundingRate
							}
						}
					`,
					{ market: marketAddress, minTimestamp: minTimestamp }
				);

				// return response ? mapTradeHistory(response.futuresPositions, false) : [];
				console.log(response)
				return response;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetAverageFundingRate;
