import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { toBigNumber } from 'utils/formatters/number';
import BigNumber from 'bignumber.js';

import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

const useExchangeFeeRate = (
	quoteCurrencyKey: CurrencyKey | null,
	baseCurrencyKey: CurrencyKey | null,
	options?: QueryConfig<BigNumber>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<BigNumber>(
		QUERY_KEYS.Synths.ExchangeFeeRate(quoteCurrencyKey ?? '', baseCurrencyKey ?? ''),
		async () => {
			const feeRateForExchange = (await synthetix.js?.contracts.Exchanger.feeRateForExchange(
				ethers.utils.formatBytes32String(quoteCurrencyKey!),
				ethers.utils.formatBytes32String(baseCurrencyKey!)
			)) as ethers.BigNumber;

			return toBigNumber(ethers.utils.formatEther(feeRateForExchange));
		},
		{
			enabled: isAppReady && quoteCurrencyKey != null && baseCurrencyKey != null,
			...options,
		}
	);
};

export default useExchangeFeeRate;
