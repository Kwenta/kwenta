import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import logError from 'utils/logError';

import { getRatesEndpoint } from './utils';

interface RateUpdate {
	baseCurrencyKey: string;
}

const useRateUpdateQuery = (
	{ baseCurrencyKey }: RateUpdate,
	options?: UseQueryOptions<any | null>
) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const ratesEndpoint = getRatesEndpoint(network?.id as NetworkId);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.LatestUpdate(network?.id as NetworkId, baseCurrencyKey),
		async () => {
			try {
				const response = await request(
					ratesEndpoint,
					gql`
						query rateUpdates($synth: String!) {
							rateUpdates(
								where: { synth: $synth }
								orderBy: timestamp
								orderDirection: desc
								first: 1
							) {
								id
								currencyKey
								synth
								rate
								timestamp
							}
						}
					`,
					{
						synth: baseCurrencyKey,
					}
				);

				let updateTime: Date = new Date();
				if (response?.rateUpdates) {
					const rateTime = response?.rateUpdates[0].timestamp;
					updateTime = new Date(parseInt(rateTime) * 1000);
				}

				return updateTime;
			} catch (e) {
				logError(`query ERROR ${e}`);
				return null;
			}
		},
		{ enabled: isL2 && !!baseCurrencyKey && network?.id !== chain.optimismGoerli.id, ...options }
	);
};

export default useRateUpdateQuery;
