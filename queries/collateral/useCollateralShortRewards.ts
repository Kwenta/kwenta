import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber, zeroBN } from 'utils/formatters/number';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

const useCollateralShortRewards = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<BigNumber>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<BigNumber>(
		QUERY_KEYS.Collateral.ShortRewards(currencyKey as string),
		async () => {
			try {
				const earned = (await synthetix.js!.contracts[`ShortingRewards${currencyKey}`].earned(
					walletAddress
				)) as ethers.BigNumber;

				return toBigNumber(ethers.utils.formatEther(earned));
			} catch (e) {
				console.log(e);
				return zeroBN;
			}
		},
		{
			enabled: isAppReady && currencyKey != null && isWalletConnected,
			...options,
		}
	);
};

export default useCollateralShortRewards;
