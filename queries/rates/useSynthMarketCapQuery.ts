import { QueryConfig, useQuery } from 'react-query';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import BigNumber from 'bignumber.js';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

import { synthToContractName } from 'utils/currencies';

import { toBigNumber } from 'utils/formatters/number';

const useSynthMarketCapQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<BigNumber>
) => {
	return useQuery<BigNumber>(
		QUERY_KEYS.Rates.MarketCap(currencyKey as string),
		async () => {
			const totalSupply = ethers.utils.formatEther(
				await synthetix.js!.contracts[synthToContractName(currencyKey!)].totalSupply()
			);

			return toBigNumber(totalSupply);
		},
		{
			enabled: currencyKey != null,
			...options,
		}
	);
};

export default useSynthMarketCapQuery;
