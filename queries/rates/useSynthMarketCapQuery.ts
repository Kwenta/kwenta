import { UseQueryOptions, useQuery } from 'react-query';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

import { synthToContractName } from 'utils/currencies';
import Wei, { wei } from '@synthetixio/wei';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	options?: UseQueryOptions<Wei>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Wei>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const data = await Promise.all([
				synthetix.js!.contracts[synthToContractName(currencyKey!)].totalSupply(),
				synthetix.js!.contracts.ExchangeRates.rateForCurrency(
					synthetix.js!.toBytes32(currencyKey as string)
				),
			]);

			const [totalSupply, price] = data.map((val) => Number(ethers.utils.formatEther(val)));

			return wei(totalSupply * price);
		},
		{
			enabled: isAppReady && currencyKey != null,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
