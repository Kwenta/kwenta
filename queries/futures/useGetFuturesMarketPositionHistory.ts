import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { currentMarketState, futuresAccountState } from 'store/futures';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';

const useGetFuturesMarketPositionHistory = (options?: UseQueryOptions<any | null>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const { chain: network } = useNetwork();
	const isL2 = useIsL2(network?.id as NetworkId);
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	const currencyKey = useRecoilValue(currentMarketState);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.MarketPositionHistory(
			network?.id as NetworkId,
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
				logError(e);
				return null;
			}
		},
		{
			enabled: isL2 && !!selectedFuturesAddress && !!currencyKey && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesMarketPositionHistory;
