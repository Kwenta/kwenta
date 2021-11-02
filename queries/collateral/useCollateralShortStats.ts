import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';
import { appReadyState } from 'store/app';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

type ReturnValueType = Record<
	CurrencyKey,
	{
		shorts: Wei;
	}
>;

const useCollateralShortStats = (
	currencyKeys: CurrencyKey[],
	options?: UseQueryOptions<ReturnValueType>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<ReturnValueType>(
		QUERY_KEYS.Collateral.ShortStats(currencyKeys.join('|')),
		async () => {
			const stats = (await Promise.all([
				...currencyKeys.map((currencyKey) =>
					synthetixjs!.contracts.CollateralManager.short(
						ethers.utils.formatBytes32String(currencyKey)
					)
				),
			])) as ethers.BigNumber[];

			const shorts = stats.splice(0, stats.length / 3);
			return currencyKeys.reduce((ret, key, i) => {
				ret[key] = {
					shorts: shorts[i] === undefined ? wei(0) : wei(shorts[i]),
				};

				return ret;
			}, {} as ReturnValueType);
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useCollateralShortStats;
