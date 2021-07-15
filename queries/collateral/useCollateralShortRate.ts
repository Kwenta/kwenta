import { useQuery, UseQueryOptions } from 'react-query';
// import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

// TODO: disabled for now - re-enable when short rate will be set. (currently its 0)
const useCollateralShortRate = (
	currencyKey: CurrencyKey | null,
	options?: UseQueryOptions<Wei>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Wei>(
		QUERY_KEYS.Collateral.ShortRate(currencyKey as string),
		async () => {
			return wei(0);
			/*
			try {
				const shortRate = (await synthetix.js!.contracts.CollateralManager.getShortRate(
					ethers.utils.formatBytes32String(currencyKey as string)
				)) as ethers.BigNumber;

				return wei(ethers.utils.formatEther(shortRate));
			} catch (e) {
				console.log(e);
				return zeroBN;
			}
			*/
		},
		{
			enabled: isAppReady && currencyKey != null,
			...options,
		}
	);
};

export default useCollateralShortRate;
