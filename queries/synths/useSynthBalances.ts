import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import orderBy from 'lodash/orderBy';
import { wei } from '@synthetixio/wei';

import { CurrencyKey } from '@synthetixio/contracts-interface';
import { Balances, SynthBalancesMap } from '@synthetixio/queries';
import { useRecoilState, useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { balancesState } from 'store/futures';

type SynthBalancesTuple = [string[], ethers.BigNumber[], ethers.BigNumber[]];

const useSynthBalances = (address: string | null, options?: UseQueryOptions<Balances>) => {
	const network = useRecoilValue(networkState);
	const [, setBalances] = useRecoilState(balancesState);

	const { synthetixjs } = Connector.useContainer();

	return useQuery<Balances>(
		QUERY_KEYS.Synths.Balances(network.id, address),
		async () => {
			if (!synthetixjs) {
				// This should never happen since the query is not enabled when synthetixjs is undefined
				throw Error('synthetixjs is undefined');
			}
			const balancesMap: SynthBalancesMap = {};
			const [
				currencyKeys,
				synthsBalances,
				synthsUSDBalances,
			]: SynthBalancesTuple = await synthetixjs.contracts.SynthUtil.synthsBalances(address);

			let totalUSDBalance = wei(0);

			currencyKeys.forEach((currencyKeyBytes32, idx) => {
				const balance = wei(synthsBalances[idx]);

				// discard empty balances
				if (balance.gt(0)) {
					const synthName = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
					const usdBalance = wei(synthsUSDBalances[idx]);

					balancesMap[synthName] = {
						currencyKey: synthName,
						balance,
						usdBalance,
					};

					totalUSDBalance = totalUSDBalance.add(usdBalance);
				}
			});

			const balances = {
				balancesMap: balancesMap,
				balances: orderBy(
					Object.values(balancesMap),
					(balance) => balance.usdBalance.toNumber(),
					'desc'
				),
				totalUSDBalance,
			};
			setBalances(balances);

			return balances;
		},
		{
			enabled: !!synthetixjs && !!address,
			...options,
		}
	);
};

export default useSynthBalances;
