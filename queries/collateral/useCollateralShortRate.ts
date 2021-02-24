import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber, zeroBN } from 'utils/formatters/number';

const useCollateralShortRate = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<BigNumber>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<BigNumber>(
		QUERY_KEYS.Collateral.ShortRate(currencyKey as string),
		async () => {
			try {
				const shortingRewards = (await synthetix.js!.contracts.CollateralManager.getShortRate(
					ethers.utils.formatBytes32String(currencyKey as string)
				)) as ethers.BigNumber;

				return toBigNumber(ethers.utils.formatEther(shortingRewards));
			} catch (e) {
				console.log(e);
				return zeroBN;
			}
		},
		{
			enabled: isAppReady && currencyKey != null,
			...options,
		}
	);
};

export default useCollateralShortRate;
