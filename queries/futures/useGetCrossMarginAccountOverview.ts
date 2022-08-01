import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { appReadyState } from 'store/app';
import { crossMarginAvailableMarginState, futuresAccountState } from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';

export default function useGetCrossMarginAccountOverview() {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setFreeMargin = useSetRecoilState(crossMarginAvailableMarginState);

	const { crossMarginAccountContract } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.MarketLimit(network.id, crossMarginAddress),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract) return { freeMargin: zeroBN };

			const freeMargin = await crossMarginAccountContract.freeMargin();
			setFreeMargin(wei(freeMargin));

			return { freeMargin: wei(freeMargin) };
		},
		{
			enabled: isAppReady && isL2 && !!crossMarginAddress,
		}
	);
}
