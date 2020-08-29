import { useQuery } from 'react-query';
import { ethers } from 'ethers';

import Contracts from 'containers/Contracts';
import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

export type Rates = Record<CurrencyKey, number>;

const useExchangeRatesQuery = () => {
	const { synthSummaryUtil } = Contracts.useContainer();

	return useQuery<Rates, any>(
		QUERY_KEYS.Rates.ExchangeRates,
		async () => {
			const exchangeRates: Rates = {};

			const [synths, rates] = await synthSummaryUtil!.synthsRates();

			synths.forEach((synth: CurrencyKey, idx: number) => {
				const synthName = ethers.utils.parseBytes32String(synth) as CurrencyKey;
				exchangeRates[synthName] = Number(ethers.utils.formatEther(rates[idx]));
			});

			return exchangeRates;
		},
		{
			enabled: synthSummaryUtil,
		}
	);
};

export default useExchangeRatesQuery;
