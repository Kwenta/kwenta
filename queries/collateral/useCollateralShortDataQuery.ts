import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

export type ShortFeeData = {
	issueFeeRate: BigNumber | null;
	shortRate: BigNumber | null;
	shortingRewards: BigNumber | null;
};

const collateralShortNoData = {
	issueFeeRate: null,
	shortRate: null,
	shortingRewards: null,
};

const useCollateralShortDataQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<ShortFeeData>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<ShortFeeData>(
		QUERY_KEYS.Collateral.ShortData(currencyKey as string),
		async () => {
			if (currencyKey == null) {
				return collateralShortNoData;
			}

			try {
				const currencyKeyBytes32 = synthetix.js?.toBytes32(currencyKey);

				const [issueFeeRate, shortRate, shortingRewards] = await Promise.all([
					synthetix.js?.contracts.CollateralShort.issueFeeRate(),
					Promise.resolve('0'),
					// TODO: check why this fails
					// synthetix.js?.contracts.CollateralManager.getShortRate(currencyKeyBytes32),
					synthetix.js?.contracts.CollateralShort.shortingRewards(currencyKeyBytes32),
				]);

				return {
					issueFeeRate: toBigNumber(ethers.utils.formatEther(issueFeeRate)),
					shortRate: toBigNumber(ethers.utils.formatEther(shortRate)),
					shortingRewards: toBigNumber(ethers.utils.formatEther(shortingRewards)),
				};
			} catch (e) {
				console.log(e);
				return collateralShortNoData;
			}
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortDataQuery;
