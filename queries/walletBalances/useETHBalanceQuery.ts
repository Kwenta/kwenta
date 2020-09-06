import { useQuery, BaseQueryOptions } from 'react-query';
import { BigNumber } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState } from 'store/connection';

import Connector from 'containers/Connector';

const useCryptoBalancesQuery = (options?: BaseQueryOptions) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<{ balance: number; balanceBN: BigNumber }, any>(
		QUERY_KEYS.WalletBalances.ETH,
		async () => {
			const balanceBN = await provider!.getBalance(walletAddress!);

			return {
				balance: Number(balanceBN),
				balanceBN,
			};
		},
		{
			enabled: provider && isWalletConnected && walletAddress,
			...options,
		}
	);
};

export default useCryptoBalancesQuery;
