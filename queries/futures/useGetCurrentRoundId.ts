import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

const useGetCurrentRoundId = (
	currencyKey: string | null,
	options?: UseQueryOptions<number | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<number | null>(
		QUERY_KEYS.Futures.CurrentRoundId(network.id, walletAddress),
		async () => {
			try {
				if (!currencyKey) return null;
				const { contracts } = synthetixjs!;
				const currentRoundId = await contracts.ExchangeRates.getCurrentRoundId(
					ethersUtils.formatBytes32String(currencyKey)
				);
				return Number(currentRoundId.toString());
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey && !!walletAddress, ...options }
	);
};

export default useGetCurrentRoundId;
