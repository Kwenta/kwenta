import synthetix, { CurrencyKey, NetworkId } from '@synthetixio/contracts-interface';
import { CRYPTO_CURRENCY_MAP } from '@synthetixio/queries/build/node/src/currency';
import { wei } from '@synthetixio/wei';
import { BigNumberish, ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';
import { chain, useNetwork, useProvider } from 'wagmi';

import ROUTES from 'constants/routes';
import { ratesState } from 'store/futures';
import { FuturesMarketKey, MarketAssetByKey } from 'utils/futures';

import { Rates } from './types';

type CurrencyRate = BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
const additionalCurrencies = [CRYPTO_CURRENCY_MAP.SNX, 'XAU', 'XAG', 'DYDX', 'APE'].map(
	ethers.utils.formatBytes32String
);

const useExchangeRatesQuery = (options?: UseQueryOptions<Rates>) => {
	const { chain: activeChain } = useNetwork();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain?.id)
			: false;
	const network = homepage || !isL2 ? chain.optimism : activeChain;
	const provider = useProvider({ chainId: network?.id });
	const synthetixjs = synthetix({
		provider: provider,
		networkId: network?.id as NetworkId,
	});

	const setRates = useSetRecoilState(ratesState);

	return useQuery<Rates>(
		['rates', 'exchangeRates2', network?.id],
		async () => {
			const exchangeRates: Rates = {};

			const [synthsRates, ratesForCurrencies] = (await Promise.all([
				synthetixjs!.contracts.SynthUtil.synthsRates(),
				synthetixjs!.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
			])) as [SynthRatesTuple, CurrencyRate[]];

			const synths = [...synthsRates[0], ...additionalCurrencies] as CurrencyKey[];
			const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

			synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
				const currencyKey = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
				const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey];

				const rate = Number(ethers.utils.formatEther(rates[idx]));

				// add rates for each synth
				exchangeRates[currencyKey] = wei(rate);

				// if a futures market exists, add the market asset rate
				if (marketAsset) exchangeRates[marketAsset] = wei(rate);
			});

			setRates(exchangeRates);

			return exchangeRates;
		},
		{
			enabled: !!synthetixjs,
			refetchInterval: 60000,
			...options,
		}
	);
};

export default useExchangeRatesQuery;
