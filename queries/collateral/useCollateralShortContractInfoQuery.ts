import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

export type CollateralContractInfo = {
	issueFeeRate: Wei;
	minCollateralRatio: Wei;
	minCollateral: Wei;
	interactionDelay: number;
	canOpenLoans: boolean;
	maxLoansPerAccount: number;
};

const useCollateralShortContractInfoQuery = (options?: UseQueryOptions<CollateralContractInfo>) => {
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
				issueFeeRate: wei(issueFeeRate),
				minCollateralRatio: wei(minCratio),
				minCollateral: wei(minCollateral),
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
