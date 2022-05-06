import { getMarketKey } from 'utils/futures';
import { useRecoilValue } from 'recoil';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';
import { getReasonFromCode } from 'queries/futures/utils';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { appReadyState } from 'store/app';
import { ethers } from 'ethers';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';

interface FuturesMarketClosure {
	isSuspended: boolean;
	reasonCode: ethers.BigNumber;
	reason: FuturesClosureReason;
}

const useFuturesSuspensionQuery = (
	currencyKey: CurrencyKey | null,
	options?: UseQueryOptions<FuturesMarketClosure>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const isReady = isAppReady && !!synthetixjs;

	return useQuery<any>(
		QUERY_KEYS.Futures.MarketClosure(network.id, currencyKey),
		async () => {
			try {
				const {
					contracts: { SystemStatus },
					utils,
				} = synthetixjs!;

				const marketKey = getMarketKey(currencyKey, network.id);
				const marketKeyBytes32 = utils.formatBytes32String(marketKey);
				const [isSuspended, reasonCode] = await SystemStatus.futuresMarketSuspension(
					marketKeyBytes32
				);

				const reason = (isSuspended ? getReasonFromCode(reasonCode) : null) as FuturesClosureReason;
				return {
					isFuturesMarketClosed: isSuspended,
					reasonCode,
					futuresClosureReason: reason,
				};
			} catch (e) {
				return null;
			}
		},
		{
			enabled: isWalletConnected ? isL2 && isReady : isReady,
			...options,
		}
	);
};

export default useFuturesSuspensionQuery;
