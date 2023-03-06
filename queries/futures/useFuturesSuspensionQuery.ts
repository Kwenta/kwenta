import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { NetworkId } from 'sdk/types/common';
import { SynthSuspensionReason } from 'sdk/types/futures';
import { getReasonFromCode } from 'sdk/utils/synths';

interface FuturesMarketClosure {
	isSuspended: boolean;
	reasonCode: ethers.BigNumber;
	reason: SynthSuspensionReason;
}

const useFuturesSuspensionQuery = (
	marketKey: string | null,
	options?: UseQueryOptions<FuturesMarketClosure>
) => {
	const { defaultSynthetixjs: synthetixjs, network, isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();

	return useQuery<any>(
		QUERY_KEYS.Futures.MarketClosure(network?.id as NetworkId, marketKey),
		async () => {
			try {
				const {
					contracts: { SystemStatus },
					utils,
				} = synthetixjs!;

				if (!marketKey) return null;

				const marketKeyBytes32 = utils.formatBytes32String(marketKey);
				const [isSuspended, reasonCode] = await SystemStatus.futuresMarketSuspension(
					marketKeyBytes32
				);

				const reason = (isSuspended
					? getReasonFromCode(reasonCode)
					: null) as SynthSuspensionReason;
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
			enabled: isWalletConnected ? isL2 && !!synthetixjs : !!synthetixjs,
			...options,
		}
	);
};

export default useFuturesSuspensionQuery;
