import { ethers } from 'ethers';
import { useQuery } from 'react-query';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

const useNumEntriesQuery = (walletAddress: string, currencyKey: CurrencyKey | null) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();

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
			enabled: !!synthetixjs && !!walletAddress && currencyKey != null,
		}
	);
};

export default useNumEntriesQuery;
