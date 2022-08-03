import synthetix, { CurrencyKey, NetworkId } from '@synthetixio/contracts-interface';
import { Balances, SynthBalancesMap } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import orderBy from 'lodash/orderBy';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState } from 'recoil';
import { useAccount, useNetwork, chain } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import { balancesState } from 'store/futures';
import { getDefaultProvider } from 'utils/network';

type SynthBalancesTuple = [string[], ethers.BigNumber[], ethers.BigNumber[]];

const useSynthBalances = (options?: UseQueryOptions<Balances>) => {
	const { address } = useAccount();
	const { chain: activeChain } = useNetwork();
	const [, setBalances] = useRecoilState(balancesState);

	const synthetixjs = synthetix({
		provider: getDefaultProvider((activeChain?.id ?? chain.optimism.id) as NetworkId),
		networkId: (activeChain?.id ?? chain.optimism.id) as NetworkId,
		useOvm: true,
	});

	return useQuery<Balances>(
		QUERY_KEYS.Synths.Balances((activeChain?.id ?? '69') as NetworkId, address!),
		async () => {
			// eslint-disable-next-line no-console
			console.log(`wallet address: `, address);
			// eslint-disable-next-line no-console
			console.log(`chain: `, activeChain);
			// eslint-disable-next-line no-console
			console.log(`synthetixjs: `, synthetixjs);
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

			// eslint-disable-next-line no-console
			console.log(`synthsUSDBalances: `, synthsUSDBalances);
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
