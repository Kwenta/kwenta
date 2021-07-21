import { UseQueryOptions, useQuery } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

import { synthToContractName } from 'utils/currencies';
import Wei, { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	options?: UseQueryOptions<Wei>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	const { synthetixjs } = Connector.useContainer();

	return useQuery<Wei>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const data = await Promise.all([
				synthetixjs!.contracts[synthToContractName(currencyKey!)].totalSupply(),
				synthetixjs!.contracts.ExchangeRates.rateForCurrency(
					synthetixjs!.toBytes32(currencyKey as string)
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
