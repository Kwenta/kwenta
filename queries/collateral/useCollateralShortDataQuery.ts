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

const useCollateralShortDataQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<ShortFeeData>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<ShortFeeData>(
		QUERY_KEYS.Collateral.ShortIssuanceFee,
		async () => {
			if (currencyKey == null) {
				return {
					issueFeeRate: null,
					shortRate: null,
					shortingRewards: null,
				};
			}
			const feeRateForExchange = await synthetix.js?.contracts.CollateralShort.issueFeeRate();
			const shortRate = await synthetix.js?.contracts.CollateralManager.getShortRate(
				synthetix.js?.toBytes32(currencyKey)
			);
			const shortingRewards = await synthetix.js?.contracts.CollateralShort.shortingRewards(
				synthetix.js?.toBytes32(currencyKey)
			);

			return {
				issueFeeRate: toBigNumber(ethers.utils.formatEther(feeRateForExchange)),
				shortRate: toBigNumber(ethers.utils.formatEther(shortRate)),
				shortingRewards: toBigNumber(ethers.utils.formatEther(shortingRewards)),
			};
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortDataQuery;
