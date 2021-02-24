import { useQuery, QueryConfig } from 'react-query';
import { ethers, utils } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import { DEFAULT_TOKEN_DECIMALS } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

export type CollateralContractInfo = {
	issueFeeRate: BigNumber;
	minCollateralRatio: BigNumber;
	minCollateral: BigNumber;
	interactionDelay: number;
	canOpenLoans: boolean;
	maxLoansPerAccount: number;
};

const useCollateralShortContractInfoQuery = (options?: QueryConfig<CollateralContractInfo>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<CollateralContractInfo>(
		QUERY_KEYS.Collateral.ShortContractInfo,
		async () => {
			const { CollateralShort } = synthetix.js!.contracts;

			const [
				issueFeeRate,
				minCratio,
				minCollateral,
				interactionDelay,
				canOpenLoans,
				maxLoansPerAccount,
			] = (await Promise.all([
				CollateralShort.issueFeeRate(),
				CollateralShort.minCratio(),
				CollateralShort.minCollateral(),
				CollateralShort.interactionDelay(),
				CollateralShort.canOpenLoans(),
				CollateralShort.maxLoansPerAccount(),
			])) as [
				ethers.BigNumber,
				ethers.BigNumber,
				ethers.BigNumber,
				ethers.BigNumber,
				boolean,
				ethers.BigNumber
			];

			return {
				issueFeeRate: toBigNumber(utils.formatUnits(issueFeeRate, DEFAULT_TOKEN_DECIMALS)),
				minCollateralRatio: toBigNumber(utils.formatUnits(minCratio, DEFAULT_TOKEN_DECIMALS)),
				minCollateral: toBigNumber(utils.formatUnits(minCollateral, DEFAULT_TOKEN_DECIMALS)),
				interactionDelay: interactionDelay.toNumber(),
				canOpenLoans,
				maxLoansPerAccount: maxLoansPerAccount.toNumber(),
			};
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortContractInfoQuery;
