import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';

const useGetFuturesMarketPositionHistory = (
	currencyKey: string | null,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network)

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.MarketPositionHistory(network.id, currencyKey || null, walletAddress || ''),
		async () => {
			if (!currencyKey) return null;
			try {
				const { contracts } = synthetixjs!;
				const marketAddress = contracts[`FuturesMarket${currencyKey.substr(1)}`].address;
				if (!marketAddress) return null;
				const response = await request(
					futuresEndpoint,
					gql`
						query marketPositionHistory($market: String!, $account: String!) {
							futuresPositions(
								where: { market: $market, account: $account }
								orderBy: timestamp
								orderDirection: desc
							) {
								id
								lastTxHash
								timestamp
								isOpen
								isLiquidated
								entryPrice
								exitPrice
								size
								margin
								asset
							}
						}
					`,
					{ market: marketAddress, account: walletAddress }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey && !!synthetixjs, ...options }
	);
};

export default useGetFuturesMarketPositionHistory;
