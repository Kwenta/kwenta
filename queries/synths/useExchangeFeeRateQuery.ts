import { ethers } from 'ethers';
import { useQuery } from 'react-query';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

const useExchangeFeeRateQuery = (
	sourceCurrencyKey: CurrencyKey | null,
	destinationCurrencyKey: CurrencyKey | null
) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();

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
			enabled: !!synthetixjs && sourceCurrencyKey != null && destinationCurrencyKey != null,
		}
	);
};

export default useExchangeFeeRateQuery;
