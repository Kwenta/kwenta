import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { orderBy } from 'lodash';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { toBigNumber, zeroBN } from 'utils/formatters/number';

export type SynthBalance = {
	currencyKey: CurrencyKey;
	balance: BigNumber;
	usdBalance: BigNumber;
};

export type SynthBalancesMap = Record<CurrencyKey, SynthBalance>;

type SynthBalancesTuple = [CurrencyKey[], number[], number[]];

export type Balances = {
	balancesMap: SynthBalancesMap;
	balances: SynthBalance[];
	totalUSDBalance: BigNumber;
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
			] = (await synthetix.js?.contracts.SynthUtil!.synthsBalances(
				walletAddress
			)) as SynthBalancesTuple;

			let totalUSDBalance = zeroBN;

			currencyKeys.forEach((currencyKey: string, idx: number) => {
				const balance = toBigNumber(ethers.utils.formatEther(synthsBalances[idx]));

				// discard empty balances
				if (balance.gt(0)) {
					const synthName = ethers.utils.parseBytes32String(currencyKey) as CurrencyKey;
					const usdBalance = toBigNumber(ethers.utils.formatEther(synthsUSDBalances[idx]));

					balancesMap[synthName] = {
						currencyKey: synthName,
						balance,
						usdBalance,
					};

					totalUSDBalance.plus(usdBalance);
				}
			});

			return {
				balancesMap,
				balances: orderBy(Object.values(balancesMap), 'usdBalance', 'desc'),
				totalUSDBalance,
			};
		},
		{
			enabled: synthetix.js && isWalletConnected,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
