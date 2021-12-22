import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

export type CollateralContractInfo = {
	issueFeeRate: Wei;
	minCollateralRatio: Wei;
	minCollateral: Wei;
	interactionDelay: number;
	canOpenLoans: boolean;
};

const useCollateralShortContractInfoQuery = (options?: UseQueryOptions<CollateralContractInfo>) => {
	const isAppReady = useRecoilValue(appReadyState);

	const { synthetixjs } = Connector.useContainer();

	return useQuery<CollateralContractInfo>(
		QUERY_KEYS.Collateral.ShortContractInfo,
		async () => {
			const { CollateralShort, SystemSettings } = synthetixjs!.contracts;

			const [
				issueFeeRate,
				minCratio,
				minCollateral,
				interactionDelay,
				canOpenLoans,
			] = (await Promise.all([
				CollateralShort.issueFeeRate(),
				CollateralShort.minCratio(),
				CollateralShort.minCollateral(),
				SystemSettings.interactionDelay(CollateralShort.address),
				CollateralShort.canOpenLoans(),
			])) as [ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, ethers.BigNumber, boolean];
			return {
				issueFeeRate: wei(issueFeeRate),
				minCollateralRatio: wei(minCratio),
				minCollateral: wei(minCollateral),
				interactionDelay: interactionDelay.toNumber(),
				canOpenLoans,
			};
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortContractInfoQuery;
