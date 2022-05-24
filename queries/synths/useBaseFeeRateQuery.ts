import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';
import QUERY_KEYS from 'constants/queryKeys';

const useBaseFeeRateQuery = (
	sourceCurrencyKey: CurrencyKey | null,
	destinationCurrencyKey: CurrencyKey | null
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

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
			enabled:
				isAppReady && !!synthetixjs && sourceCurrencyKey != null && destinationCurrencyKey != null,
		}
	);
};

export default useBaseFeeRateQuery;
