import { BaseQueryOptions, useQuery } from 'react-query';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

import { synthToContractName } from 'utils/currencies';

import { MarketCap } from './types';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	priceRate: number | null,
	selectPriceCurrencyRate: number | null,
	options?: BaseQueryOptions
) => {
	return useQuery<MarketCap, any>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			let marketCap = 0;
			if (priceRate && selectPriceCurrencyRate && currencyKey) {
				const totalSupply = Number(
					ethers.utils.formatEther(
						await synthetix.js!.contracts[synthToContractName(currencyKey)].totalSupply()
					)
				);

				marketCap = totalSupply * (priceRate / selectPriceCurrencyRate);

				return {
					marketCap,
				};
			} else {
				return {
					marketCap,
				};
			}
		},
		{
			enabled: currencyKey && selectPriceCurrencyRate && priceRate,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
