import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import zipObject from 'lodash/zipObject';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

const useCollateralShortStats = (
	currencyKeys: CurrencyKey[],
	options?: QueryConfig<Record<CurrencyKey, BigNumber>>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<Record<CurrencyKey, BigNumber>>(
		QUERY_KEYS.Collateral.ShortStats(currencyKeys.join('|')),
		async () => {
			const shorts = (await Promise.all(
				currencyKeys.map((currencyKey) =>
					synthetix.js!.contracts.CollateralManager.short(
						ethers.utils.formatBytes32String(currencyKey)
					)
				)
			)) as ethers.BigNumber[];

			return zipObject(
				currencyKeys,
				shorts.map((short) => toBigNumber(ethers.utils.formatEther(short)))
			);
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortStats;
