import { useQuery, BaseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import { walletAddressState, isWalletConnectedState } from 'store/connection';
import synthetix from 'lib/synthetix';

import { WalletBalancesMap } from './types';

const useSynthsBalancesQuery = (options?: BaseQueryOptions) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<WalletBalancesMap, any>(
		QUERY_KEYS.WalletBalances.Synths,
		async () => {
			const balances: WalletBalancesMap = {};

			const [
				synthsKeys,
				synthsBalances,
				synthsUSDBalances,
			] = await synthetix.synthSummaryUtil!.synthsBalances(walletAddress);

			synthsKeys.forEach((key: string, i: string) => {
				const synthName = ethers.utils.parseBytes32String(key) as CurrencyKey;

				balances[synthName] = {
					balance: Number(ethers.utils.formatEther(synthsBalances[i])),
					balanceBN: synthsBalances[i],
					usdBalance: Number(ethers.utils.formatEther(synthsUSDBalances[i])),
				};
			});

			return balances;
		},
		{
			enabled: synthetix.synthSummaryUtil && isWalletConnected,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
