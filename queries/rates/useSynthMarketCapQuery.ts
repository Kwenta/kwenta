import { BaseQueryOptions, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { MarketCap } from './types';
import { CurrencyKey } from 'constants/currency';
import synthetix from 'lib/synthetix';
import { ethers } from 'ethers';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	selectPriceCurrencyRate: number | null,
	options?: BaseQueryOptions
) => {
	return useQuery<MarketCap, any>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const currencyKeyToContract = `Synth${currencyKey}`;

			const totalSupply = Number(
				ethers.utils.formatEther(await synthetix.js!.contracts[currencyKeyToContract].totalSupply())
			);

			const priceRate = selectPriceCurrencyRate ?? 0;

			const marketCap = totalSupply * priceRate;

			return {
				marketCap,
			};
		},
		{
			enabled: currencyKey && selectPriceCurrencyRate,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
