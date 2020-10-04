import { QueryConfig, useQuery } from 'react-query';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/defaults';

import { synthToContractName } from 'utils/currencies';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	priceRate: number | null,
	options?: QueryConfig<number>
) => {
	return useQuery<number>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const totalSupply = Number(
				ethers.utils.formatEther(
					await synthetix.js!.contracts[synthToContractName(currencyKey!)].totalSupply()
				)
			);

			return totalSupply * priceRate!;
		},
		{
			enabled: currencyKey != null && priceRate != null,
			refetchInterval: DEFAULT_REQUEST_REFRESH_INTERVAL,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
