import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';
import QUERY_KEYS from 'constants/queryKeys';

const useBaseFeeRateQuery = (currencyKey: CurrencyKey | null) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery(
		QUERY_KEYS.Synths.BaseFeeRate(currencyKey!),
		async () => {
			const { SystemSettings } = synthetixjs!.contracts;

			const baseFeeRate = await SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(currencyKey as string)
			);
			return baseFeeRate ? baseFeeRate : null;
		},
		{
			enabled: isAppReady && !!synthetixjs && currencyKey != null,
		}
	);
};

export default useBaseFeeRateQuery;
