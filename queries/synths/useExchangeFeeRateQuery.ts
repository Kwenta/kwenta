import { ethers } from 'ethers';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';

const useExchangeFeeRateQuery = (
	sourceCurrencyKey: CurrencyKey | null,
	destinationCurrencyKey: CurrencyKey | null
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery(
		QUERY_KEYS.Synths.ExchangeFeeRate(sourceCurrencyKey!, destinationCurrencyKey!),
		async () => {
			const { Exchanger } = synthetixjs!.contracts;

			return await Exchanger.feeRateForExchange(
				ethers.utils.formatBytes32String(sourceCurrencyKey as string),
				ethers.utils.formatBytes32String(destinationCurrencyKey as string)
			);
		},
		{
			enabled:
				isAppReady && !!synthetixjs && sourceCurrencyKey != null && destinationCurrencyKey != null,
		}
	);
};

export default useExchangeFeeRateQuery;
