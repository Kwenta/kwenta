import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

const useCollateralShortRewards = (
	currencyKey: CurrencyKey | null,
	options?: UseQueryOptions<Wei>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	const { synthetixjs } = Connector.useContainer();

	return useQuery<Wei>(
		QUERY_KEYS.Collateral.ShortRewards(currencyKey as string),
		async () => {
			try {
				const earned = (await synthetixjs!.contracts[`ShortingRewards${currencyKey}`].earned(
					walletAddress
				)) as ethers.BigNumber;

				return wei(ethers.utils.formatEther(earned));
			} catch (e) {
				console.log(e);
				return wei(0);
			}
		},
		{
			enabled: isAppReady && currencyKey != null && isWalletConnected,
			...options,
		}
	);
};

export default useCollateralShortRewards;
