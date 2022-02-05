import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

const useBaseFeeRateQuery = (currencyKey: CurrencyKey | null) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery(
		['synths', 'baseFeeRate'],
		async () => {
			const { SystemSettings } = synthetixjs!.contracts;

			const [baseFeeRate] = (await Promise.all([
				SystemSettings.exchangeFeeRate(ethers.utils.formatBytes32String(currencyKey as string)),
			])) as [Wei];
			return baseFeeRate ? baseFeeRate : null;
		},
		{
			enabled: isAppReady && !!synthetixjs && currencyKey != null,
		}
	);
};

export default useBaseFeeRateQuery;
