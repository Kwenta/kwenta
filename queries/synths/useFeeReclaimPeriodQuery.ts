import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

const useFeeReclaimPeriodQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<number>
) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<number>(
		QUERY_KEYS.Synths.FeeReclaimPeriod(currencyKey ?? ''),
		async () => {
			const maxSecsLeftInWaitingPeriod = (await synthetix.js?.contracts.Exchanger.maxSecsLeftInWaitingPeriod(
				walletAddress,
				ethers.utils.formatBytes32String(currencyKey!)
			)) as BigNumberish;

			return Number(maxSecsLeftInWaitingPeriod);
		},
		{
			enabled: synthetix.js && currencyKey != null && isWalletConnected,
			...options,
		}
	);
};

export default useFeeReclaimPeriodQuery;
