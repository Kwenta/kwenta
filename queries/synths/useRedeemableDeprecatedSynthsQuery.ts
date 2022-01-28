import { ethers } from 'ethers';
import { Provider, Contract } from 'ethcall';
import { useQuery, UseQueryOptions } from 'react-query';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

import { DeprecatedSynthBalance, DeprecatedSynthsBalances } from '@synthetixio/queries';
import { getProxySynthSymbol } from './utils';
import Connector from 'containers/Connector';
import SynthRedeemerABI from 'lib/abis/SynthRedeemer.json';

const ethCallProvider = new Provider();

const useRedeemableDeprecatedSynthsQuery = (
	walletAddress: string | null,
	options?: UseQueryOptions<DeprecatedSynthsBalances>
) => {
	const { synthetixjs, network, provider } = Connector.useContainer();
	return useQuery<DeprecatedSynthsBalances>(
		['WalletBalances', 'RedeemableDeprecatedSynths', network.id, walletAddress],
		async () => {
			await ethCallProvider.init(provider as any);
			const {
				contracts: { SynthRedeemer },
			} = synthetixjs!;

			const synthDeprecatedFilter = SynthRedeemer.filters.SynthDeprecated();
			const deprecatedSynthsEvents = await SynthRedeemer.queryFilter(synthDeprecatedFilter);
			const deprecatedProxySynthsAddresses: string[] = deprecatedSynthsEvents.map(
				(e: any) => e.args?.synth ?? ''
			);

			const Redeemer = new Contract(SynthRedeemer.address, SynthRedeemerABI);

			const symbolCalls = [];
			const balanceCalls = [];

			for (const addr of deprecatedProxySynthsAddresses) {
				symbolCalls.push(getProxySynthSymbol(addr));
				balanceCalls.push(Redeemer.balanceOf(addr, walletAddress));
			}

			const deprecatedSynths = (await ethCallProvider.all(symbolCalls, {})) as CurrencyKey[];
			const balanceData = (await ethCallProvider.all(balanceCalls, {})) as ethers.BigNumber[];
			const balances = balanceData.map((balance) => wei(balance));

			let totalUSDBalance = wei(0);
			const cryptoBalances: DeprecatedSynthBalance[] = [];

			for (let i = 0; i < balances.length; i++) {
				const usdBalance = balances[i];
				if (usdBalance.gt(0)) {
					const currencyKey = deprecatedSynths[i];
					totalUSDBalance = totalUSDBalance.add(usdBalance);
					cryptoBalances.push({
						currencyKey,
						proxyAddress: deprecatedProxySynthsAddresses[i],
						balance: wei(0),
						usdBalance,
					});
				}
			}

			return {
				balances: cryptoBalances,
				totalUSDBalance,
			};
		},
		{
			enabled: !!network.id && !!walletAddress,
			...options,
		}
	);
};

export default useRedeemableDeprecatedSynthsQuery;
