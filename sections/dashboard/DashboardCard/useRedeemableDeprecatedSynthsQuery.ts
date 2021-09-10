import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries, {
	Balances,
	SynthBalance,
	SynthBalancesMap,
} from '@synthetixio/queries';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { ethers } from 'ethers';

const useRedeemableDeprecatedSynthsQuery = (options?: UseQueryOptions<Balances>) => {
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const { synthetixjs, provider } = Connector.useContainer();

	return useQuery<Balances>(
		['WalletBalances', 'RedeemableDeprecatedSynths', network?.id!, walletAddress],
		async () => {
			const {
				// SynthRedeemer: Redeemer,
				Synthetix,
				ProxysBTC,
				ProxysETH,
			} = synthetixjs!.contracts;

			// const synthDeprecatedFilter = Redeemer.filter.SynthDeprecated();
			// const deprecatedSynthsEvents = await Redeemer.queryFilter(synthDeprecatedFilter);
			// const deprecatedSynthsAddresses: string[] = deprecatedSynthsEvents.map(
			// 	(e) => e.args?.synth ?? ''
			// );

			const deprecatedProxySynthsAddresses = [ProxysBTC, ProxysETH].map((c) => c.address);
			// console.log(deprecatedProxySynthsAddresses);

			const getProxySynthTarget = (address: string) => {
				const c = new ethers.Contract(
					address,
					[
						{
							constant: true,
							inputs: [],
							name: 'target',
							outputs: [{ name: '', type: 'address' }],
							payable: false,
							stateMutability: 'view',
							type: 'function',
						},
					],
					provider!
				);
				return c.target();
			};
			const deprecatedSynthsAddresses = deprecatedProxySynthsAddresses.map(getProxySynthTarget);
			// console.log(deprecatedSynthsAddresses);

			const getSynthCurrentyKeyFromAddress = (address: string) =>
				Synthetix.synthsByAddress(address);
			const deprecatedSynths = await Promise.all(
				deprecatedSynthsAddresses.map(getSynthCurrentyKeyFromAddress)
			);
			// console.log(deprecatedSynths);

			// const getRedeemableSynthBalance = async (currencyKey: string) =>
			// 	Redeemer.balanceOf(currencyKey, walletAddress);
			// const balances = await Promise.all(deprecatedSynths.map(getRedeemableSynthBalance));

			const exchangeRates = exchangeRatesQuery.data ?? null;

			const balances = [wei(3), wei(4)];
			let totalUSDBalance = wei(0);

			const cryptoBalances: SynthBalance[] = balances.map((balance, i) => {
				const currencyKey = synthetixjs!.utils.parseBytes32String(
					deprecatedSynths[i]
				) as CurrencyKey;
				const synthPriceRate = getExchangeRatesForCurrencies(
					exchangeRates,
					currencyKey,
					selectedPriceCurrency.name
				);

				const usdBalance = balance.mul(wei(synthPriceRate));
				totalUSDBalance = totalUSDBalance.add(usdBalance);
				return {
					currencyKey,
					balance,
					usdBalance,
				};
			});
			return {
				balances: cryptoBalances,
				balancesMap: {} as SynthBalancesMap,
				totalUSDBalance,
			};
		},
		{
			enabled: !!synthetixjs! && isWalletConnected,
			...options,
		}
	);
};

export default useRedeemableDeprecatedSynthsQuery;
