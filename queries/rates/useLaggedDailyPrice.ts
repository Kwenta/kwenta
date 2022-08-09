import EthDater from 'ethereum-block-by-date';
import request, { gql } from 'graphql-request';
import { values } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { marketAssetsState } from 'store/futures';
import { networkState } from 'store/wallet';
import logError from 'utils/logError';

import { RATES_ENDPOINT_MAINNET } from './constants';
import { Price } from './types';
import { getRatesEndpoint, mapLaggedDailyPrices } from './utils';

const useLaggedDailyPrice = (options?: UseQueryOptions<Price[] | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const marketAssets = useRecoilValue(marketAssetsState);
	const { provider, synthsMap } = Connector.useContainer();

	const minTimestamp = Math.floor(Date.now()) - 60 * 60 * 24 * 1000;
	const synths = [...marketAssets, ...values(synthsMap).map(({ name }) => name)];

	const ratesEndpoint =
		window.location.pathname === ROUTES.Home.Root
			? RATES_ENDPOINT_MAINNET
			: getRatesEndpoint(network.id);

	return useQuery<Price[] | null>(
		QUERY_KEYS.Rates.PastRates(network.id, synths),
		async () => {
			if (!provider) return null;
			const dater = new EthDater(provider);

			const block = await dater.getDate(minTimestamp, true, false);

			try {
				const response = await request(
					ratesEndpoint,
					gql`
						query latestRates($synths: [String!]!) {
							latestRates(
								where: {
									id_in: $synths
								}
								block: { number: ${block.block} }
							) {
								id
								rate
							}
						}
					`,
					{
						synths: synths,
					}
				);
				return response ? mapLaggedDailyPrices(response.latestRates) : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isAppReady && synths.length > 0, refetchInterval: 60000, ...options }
	);
};

export default useLaggedDailyPrice;
