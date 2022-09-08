import { ethers } from 'ethers';
import { useQuery } from 'react-query';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

const useBaseFeeRateQuery = (
	sourceCurrencyKey: CurrencyKey | null,
	destinationCurrencyKey: CurrencyKey | null
) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();

	return useQuery(
		QUERY_KEYS.Synths.BaseFeeRate(sourceCurrencyKey!, destinationCurrencyKey!),
		async () => {
			const { SystemSettings } = synthetixjs!.contracts;

			const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
				SystemSettings.exchangeFeeRate(
					ethers.utils.formatBytes32String(sourceCurrencyKey as string)
				),
				SystemSettings.exchangeFeeRate(
					ethers.utils.formatBytes32String(destinationCurrencyKey as string)
				),
			]);

			return sourceCurrencyFeeRate && destinationCurrencyFeeRate
				? sourceCurrencyFeeRate.add(destinationCurrencyFeeRate)
				: null;
		},
		{
			enabled: !!synthetixjs && sourceCurrencyKey != null && destinationCurrencyKey != null,
		}
	);
};

export default useBaseFeeRateQuery;
