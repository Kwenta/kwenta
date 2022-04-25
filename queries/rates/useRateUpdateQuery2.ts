import { useQuery, UseQueryOptions } from 'react-query';
import request, { gql } from 'graphql-request';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import {
	CRYPTO_CURRENCY_MAP,
	iStandardSynth,
	synthToAsset,
} from '@synthetixio/queries/build/node/src/currency';

import Connector from 'containers/Connector';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { RateUpdates } from './types';



export const useRateUpdateQuery2 = async (synth: string) => {
	if (synth === undefined) return null;

	const RATES_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main';

	try {
		const response = await request(
			RATES_ENDPOINT,
			gql`
				query rateUpdates($synth: String!) {
					rateUpdates(
						where: { synth: $synth }
						orderBy: timestamp
						orderDirection: desc
						first: 1
					) {
						id
						currencyKey
						synth
						rate
						timestamp
					}
				}
			`,
			{
				synth: synth,
			}
		);

		let updateTime: Date = new Date();
		if (response?.rateUpdates) {
			const rateTime = response?.rateUpdates[0].timestamp;
			updateTime = new Date(parseInt(rateTime) * 1000);
		}

		return updateTime;
	} catch (e) {
		console.log('query ERROR', e);
		return null;
	}
};


type CurrencyRate = BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
const additionalCurrencies = [CRYPTO_CURRENCY_MAP.SNX, 'XAU', 'XAG'].map(
	ethers.utils.formatBytes32String
);

const useRateUpdateQuery3 = (options?: UseQueryOptions<RateUpdates>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const isReady = isAppReady && !!synthetixjs;

	return useQuery<RateUpdates>(
		['rates', 'exchangeRates2', network.id],
		async () => {
			const exchangeRates: RateUpdates = {};

			const [synthsRates, ratesForCurrencies] = (await Promise.all([
				synthetixjs!.contracts.SynthUtil.synthsRates(),
				synthetixjs!.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
			])) as [SynthRatesTuple, CurrencyRate[]];

			const synths = [...synthsRates[0], ...additionalCurrencies] as CurrencyKey[];
			const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

			synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
				const currencyKey = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
				const rate = Number(ethers.utils.formatEther(rates[idx]));

				exchangeRates[currencyKey] = wei(rate);
				// only interested in the standard synths (sETH -> ETH, etc)
				if (iStandardSynth(currencyKey)) {
					exchangeRates[synthToAsset(currencyKey)] = wei(rate);
				}
			});

			return exchangeRates;
		},
		{
			enabled: isWalletConnected ? isL2 && isReady : isReady,
			...options,
		}
	);
};

export default useExchangeRatesQuery;
