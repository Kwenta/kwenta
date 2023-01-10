import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { values } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { getDisplayAsset } from 'sdk/utils/futures';
import { selectMarketAssets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { pastRatesState } from 'store/futures';
import logError from 'utils/logError';

import { RATES_ENDPOINT_OP_MAINNET } from './constants';
import { LatestRate, Price } from './types';
import { getRatesEndpoint, mapLaggedDailyPrices } from './utils';

const useLaggedDailyPrice = (options?: UseQueryOptions<Price[] | null>) => {
	const { network, synthsMap } = Connector.useContainer();
	const marketAssets = useAppSelector(selectMarketAssets);
	const setPastRates = useSetRecoilState(pastRatesState);

	const minTimestamp = Math.floor((Date.now() - 60 * 60 * 24 * 1000) / 1000);
	const synths = [...marketAssets, ...values(synthsMap).map(({ name }) => name)];

	const ratesEndpoint =
		window.location.pathname === ROUTES.Home.Root
			? RATES_ENDPOINT_OP_MAINNET
			: getRatesEndpoint(network?.id as NetworkId);

	return useQuery<Price[] | null>(
		QUERY_KEYS.Rates.PastRates(network?.id as NetworkId, synths),
		async () => {
			try {
				const rateUpdateQueries = synths.map((synth) => {
					return gql`
					# last before timestamp
					${synth}: rateUpdates(
						first: 1
						where: { synth: "${getDisplayAsset(synth) ?? synth}", timestamp_gte: $minTimestamp }
						orderBy: timestamp
						orderDirection: asc
					) {
						synth
						rate
					}
				`;
				});

				const response = await request(
					ratesEndpoint,
					gql`
						query rateUpdates($minTimestamp: BigInt!) {
							${rateUpdateQueries.reduce((acc: string, curr: string) => {
								return acc + curr;
							})}
					}`,
					{
						minTimestamp: minTimestamp,
					}
				);
				const latestRates = (response ? Object.values(response).flat() : []) as LatestRate[];
				const pastRates = mapLaggedDailyPrices(latestRates);

				setPastRates(pastRates);
				return pastRates;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: synths.length > 0 && marketAssets.length > 0,
			refetchInterval: 1000 * 60 * 15,
			...options,
		}
	);
};

export default useLaggedDailyPrice;
