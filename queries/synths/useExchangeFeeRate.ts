import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

const useExchangeFeeRate = (
	quoteCurrencyKey: CurrencyKey | null,
	baseCurrencyKey: CurrencyKey | null,
	options?: QueryConfig<number>
) => {
	const isAppReady = useRecoilValue(appReadyState);

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
			enabled: isAppReady && quoteCurrencyKey != null && baseCurrencyKey != null,
			...options,
		}
	);
};

export default useExchangeFeeRate;
