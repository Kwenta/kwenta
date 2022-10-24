import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountTypeState } from 'store/futures';
import logError from 'utils/logError';

import { FuturesAccountType, getFuturesTrades } from '../futures/subgraph';
import { TradingRewardScore } from '../futures/types';
import { getFuturesEndpoint } from '../futures/utils';

const useGetTradingRewardScoreForAccount = (
	account: string | null,
	options?: UseQueryOptions<TradingRewardScore | null>
) => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { network, isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<TradingRewardScore | null>(
		QUERY_KEYS.Staking.SpotsFee(account),
		async () => {
			if (!account || !isL2) return null;

			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							account: account,
							accountType: selectedAccountType as FuturesAccountType,
						},
						orderDirection: 'desc',
						orderBy: 'timestamp',
					},
					{
						id: true,
						timestamp: true,
						account: true,
						abstractAccount: true,
						accountType: true,
						margin: true,
						size: true,
						asset: true,
						price: true,
						positionId: true,
						positionSize: true,
						positionClosed: true,
						pnl: true,
						feesPaid: true,
						orderType: true,
					}
				);
				return response ? null : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isWalletConnected || (isL2 && !!account), ...options }
	);
};

export default useGetTradingRewardScoreForAccount;
