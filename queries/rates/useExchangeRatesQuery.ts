import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { BigNumberish, ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';

import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { ratesState } from 'store/futures';
import { FuturesMarketKey, MarketAssetByKey } from 'utils/futures';

import { Rates } from './types';

type CurrencyRate = BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
const additionalCurrencies = [
	'SNX',
	'XAU',
	'XAG',
	'DYDX',
	'APE',
	'BNB',
	'DOGE',
	'DebtRatio',
	'XMR',
].map(ethers.utils.formatBytes32String);

const useExchangeRatesQuery = (options?: UseQueryOptions<Rates>) => {
	const { network, defaultSynthetixjs, l2Synthetixjs } = Connector.useContainer();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const synthetixjs = homepage ? l2Synthetixjs : defaultSynthetixjs;

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
