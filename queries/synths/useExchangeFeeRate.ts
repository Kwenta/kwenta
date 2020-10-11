import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';

const useExchangeFeeRate = (
	quoteCurrencyKey: CurrencyKey | null,
	baseCurrencyKey: CurrencyKey | null,
	options?: QueryConfig<number>
) => {
	return useQuery<number>(
		QUERY_KEYS.Synths.ExchangeFeeRate(quoteCurrencyKey ?? '', baseCurrencyKey ?? ''),
		async () => {
			const feeRateForExchange = (await synthetix.js?.contracts.Exchanger.feeRateForExchange(
				ethers.utils.formatBytes32String(quoteCurrencyKey!),
				ethers.utils.formatBytes32String(baseCurrencyKey!)
			)) as BigNumberish;

			return Number(ethers.utils.formatEther(feeRateForExchange));
		},
		{
			enabled: synthetix.js && quoteCurrencyKey != null && baseCurrencyKey != null,
			...options,
		}
	);
};

export default useExchangeFeeRate;
