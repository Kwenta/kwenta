import { getMarketKey } from 'utils/futures';
import { useRecoilValue } from 'recoil';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';
import { getReasonFromCode } from 'queries/futures/utils';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SynthSuspensionReason } from '@synthetixio/queries';
import { appReadyState } from 'store/app';
import { ethers } from 'ethers';

export type FuturesSuspensionReason = SynthSuspensionReason;

interface FuturesMarketClosure {
	isSuspended: boolean;
	reasonCode: ethers.BigNumber;
	reason: FuturesSuspensionReason;
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
			if (isWalletConnected && !isL2) {
				return null;
			}

			try {
				const {
					contracts: { SystemStatus },
					utils,
				} = synthetixjs!;

				const marketKey = getMarketKey(currencyKey, network.id);
				const [isSuspended, reason] = (await SystemStatus.getFuturesMarketSuspensions([
					utils.formatBytes32String(marketKey),
				])) as [boolean, ethers.BigNumber];

				return {
					isSuspended,
					reasonCode: reason,
					reason: (isSuspended ? getReasonFromCode(reason) : null) as FuturesSuspensionReason,
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
