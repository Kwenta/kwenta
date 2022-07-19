import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';
import { getDisplayAsset } from 'utils/futures';
import { FUTURES_POSITION_FRAGMENT } from './constants';
import { currentMarketState, futuresAccountState } from 'store/futures';

const useGetFuturesMarketPositionHistory = (options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network);

	const currencyKey = useRecoilValue(currentMarketState);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.MarketPositionHistory(
			network.id,
			currencyKey || null,
			selectedFuturesAddress || ''
		),
		async () => {
			if (!currencyKey) return null;
			try {
				const { contracts } = synthetixjs!;
				const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;
				if (!marketAddress) return null;
				const response = await request(
					futuresEndpoint,
					gql`
						${FUTURES_POSITION_FRAGMENT}
						query marketPositionHistory($market: String!, $account: String!) {
							futuresPositions(
								where: { market: $market, account: $account }
								orderBy: timestamp
								orderDirection: desc
							) {
								...FuturesPositionFragment
							}
						}
					`,
					{ market: marketAddress, account: selectedFuturesAddress }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!selectedFuturesAddress && !!currencyKey && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesMarketPositionHistory;
