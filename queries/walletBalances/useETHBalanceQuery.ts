import { useQuery, QueryConfig } from 'react-query';
import { BigNumber } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState } from 'store/wallet';

import Connector from 'containers/Connector';

type PromiseResult = { balance: number; balanceBN: BigNumber };

const useETHBalancesQuery = (options?: QueryConfig<PromiseResult>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<PromiseResult>(
		QUERY_KEYS.WalletBalances.ETH(walletAddress ?? ''),
		async () => {
			const balanceBN = await provider!.getBalance(walletAddress!);

			return {
				balance: Number(balanceBN) / 1e18,
				balanceBN,
			};
		},
		{
			enabled: provider && isWalletConnected && walletAddress,
			...options,
		}
	);
};

export default useETHBalancesQuery;
