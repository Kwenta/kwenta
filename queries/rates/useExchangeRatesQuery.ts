import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';
import { iStandardSynth, synthToAsset } from 'utils/currencies';

import { appReadyState } from 'store/app';

export type Rates = Record<CurrencyKey, number>;

const useExchangeRatesQuery = (options?: QueryConfig<Rates>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Rates>(
		QUERY_KEYS.Rates.ExchangeRates,
		async () => {
			const exchangeRates: Rates = {};

			const [synths, rates] = await synthetix.js?.contracts.SynthUtil.synthsRates();

			synths.forEach((synth: CurrencyKey, idx: number) => {
				const synthName = ethers.utils.parseBytes32String(synth) as CurrencyKey;
				const rate = Number(ethers.utils.formatEther(rates[idx]));

				exchangeRates[synthName] = rate;
				// only interested in the standard synths (sETH -> ETH, etc)
				if (iStandardSynth(synthName)) {
					exchangeRates[synthToAsset(synthName)] = rate;
				}
			});

			return exchangeRates;
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useExchangeRatesQuery;
