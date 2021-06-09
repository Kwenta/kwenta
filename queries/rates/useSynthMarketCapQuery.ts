import { QueryConfig, useQuery } from 'react-query';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import BigNumber from 'bignumber.js';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

import { synthToContractName } from 'utils/currencies';

import { toBigNumber } from 'utils/formatters/number';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<BigNumber>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<BigNumber>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const data = await Promise.all([
				synthetix.js!.contracts[synthToContractName(currencyKey as string)].totalSupply(),
				synthetix.js!.contracts.ExchangeRates.rateForCurrency(
					synthetix.js!.toBytes32(currencyKey as string)
				),
			]);

			const [totalSupply, price] = data.map((val) => Number(ethers.utils.formatEther(val)));

			return toBigNumber(totalSupply * price);
		},
		{
			enabled: isAppReady && currencyKey != null,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
