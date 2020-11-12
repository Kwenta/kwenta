import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

const useFeeReclaimPeriodQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<number>
) => {
	const isAppReady = useRecoilValue(appReadyState);
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
			enabled: isAppReady && currencyKey != null && isWalletConnected,
			...options,
		}
	);
};

export default useFeeReclaimPeriodQuery;
