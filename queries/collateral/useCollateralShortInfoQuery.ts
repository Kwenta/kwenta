import { useQuery, QueryConfig } from 'react-query';
import { ethers, utils } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import { DEFAULT_TOKEN_DECIMALS } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

export type CollateralShortInfo = {
	issueFeeRate: BigNumber;
	minCollateralRatio: BigNumber;
	interactionDelay: number;
};

const useCollateralShortInfoQuery = (options?: QueryConfig<CollateralShortInfo>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<CollateralShortInfo>(
		QUERY_KEYS.Collateral.ShortInfo,
		async () => {
			const { CollateralShort } = synthetix.js!.contracts;

			const [issueFeeRate, minCratio, interactionDelay] = (await Promise.all([
				CollateralShort.issueFeeRate(),
				CollateralShort.minCratio(),
				CollateralShort.interactionDelay(),
			])) as [ethers.BigNumber, ethers.BigNumber, ethers.BigNumber];

			return {
				issueFeeRate: toBigNumber(utils.formatUnits(issueFeeRate, DEFAULT_TOKEN_DECIMALS)),
				minCollateralRatio: toBigNumber(utils.formatUnits(minCratio, DEFAULT_TOKEN_DECIMALS)),
				interactionDelay: interactionDelay.toNumber(),
			};
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortInfoQuery;
