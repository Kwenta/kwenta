import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { currentMarketState } from 'store/futures';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';

const useGetFuturesMarketPositionHistory = (options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network);

	const currencyKey = useRecoilValue(currentMarketState);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.MarketPositionHistory(network.id, currencyKey || null, walletAddress || ''),
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
					{ market: marketAddress, account: walletAddress }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey && !!synthetixjs, ...options }
	);
};

export default useGetFuturesMarketPositionHistory;
