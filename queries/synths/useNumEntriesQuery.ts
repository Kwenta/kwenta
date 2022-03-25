import { ethers } from 'ethers';
import { useQuery } from 'react-query';
import { CurrencyKey } from 'constants/currency';

import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

const useNumEntriesQuery = (walletAddress: string, currencyKey: CurrencyKey | null) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery(
		QUERY_KEYS.Synths.NumEntries(walletAddress, currencyKey!),
		async () => {
			const { Exchanger } = synthetixjs!.contracts;

			const { numEntries } = await Exchanger.settlementOwing(
				walletAddress,
				ethers.utils.formatBytes32String(currencyKey as string)
			);

			return numEntries ? numEntries : null;
		},
		{
			enabled: isAppReady && !!synthetixjs && !!walletAddress && currencyKey != null,
		}
	);
};

export default useNumEntriesQuery;
