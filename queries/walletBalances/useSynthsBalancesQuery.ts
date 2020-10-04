import { useQuery, QueryConfig } from 'react-query';
import { ethers, BigNumberish } from 'ethers';
import { useRecoilValue } from 'recoil';
import { orderBy } from 'lodash';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

export type SynthBalance = {
	currencyKey: CurrencyKey;
	balance: number;
	balanceBN: BigNumberish;
	usdBalance: number;
};

export type SynthBalancesMap = Record<CurrencyKey, SynthBalance>;

type SynthBalancesTuple = [CurrencyKey[], number[], number[]];

export type Balances = {
	balancesMap: SynthBalancesMap;
	balances: SynthBalance[];
	totalUSDBalance: number;
};

const useSynthsBalancesQuery = (options?: QueryConfig<Balances>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<Balances>(
		QUERY_KEYS.WalletBalances.Synths(walletAddress ?? '', network?.id!),
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
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
