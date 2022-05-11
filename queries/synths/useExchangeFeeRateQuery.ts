import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';
import QUERY_KEYS from 'constants/queryKeys';

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
