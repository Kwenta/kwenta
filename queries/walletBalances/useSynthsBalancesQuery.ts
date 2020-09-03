import { useQuery, BaseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, CurrencyKeys } from 'constants/currency';

import { walletAddressState, isWalletConnectedState } from 'store/connection';
import synthetix from 'lib/synthetix';

import { SynthBalances, SynthBalancesMap } from './types';
import { orderBy } from 'lodash';

type SynthBalancesTuple = [CurrencyKeys, number[], number[]];

const useSynthsBalancesQuery = (options?: BaseQueryOptions) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<
		{ balancesMap: SynthBalancesMap; balances: SynthBalances; totalUSDBalance: number },
		any
	>(
		QUERY_KEYS.WalletBalances.Synths,
		async () => {
			const balancesMap: SynthBalancesMap = {};

			const [
				currencyKeys,
				synthsBalances,
				synthsUSDBalances,
			] = (await synthetix.synthSummaryUtil!.synthsBalances(walletAddress)) as SynthBalancesTuple;

			let totalUSDBalance = 0;

			currencyKeys.forEach((currencyKey: string, idx: number) => {
				const balance = Number(ethers.utils.formatEther(synthsBalances[idx]));

				// discard empty balances
				if (balance > 0) {
					const synthName = ethers.utils.parseBytes32String(currencyKey) as CurrencyKey;
					const usdBalance = Number(ethers.utils.formatEther(synthsUSDBalances[idx]));

					balancesMap[synthName] = {
						currencyKey: synthName,
						balance,
						balanceBN: synthsBalances[idx],
						usdBalance,
					};

					totalUSDBalance += usdBalance;
				}
			});

			return {
				balancesMap,
				balances: orderBy(Object.values(balancesMap), 'usdBalance', 'desc'),
				totalUSDBalance,
			};
		},
		{
			enabled: synthetix.synthSummaryUtil && isWalletConnected,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
