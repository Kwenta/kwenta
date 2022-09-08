import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { crossMarginAvailableMarginState, futuresAccountState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

export default function useGetCrossMarginAccountOverview() {
	const { network } = Connector.useContainer();
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setFreeMargin = useSetRecoilState(crossMarginAvailableMarginState);

	const { crossMarginAccountContract } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.MarketLimit(network?.id as NetworkId, crossMarginAddress),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract) return { freeMargin: zeroBN };

			const freeMargin = await crossMarginAccountContract.freeMargin();

			setFreeMargin(wei(freeMargin));

			return { freeMargin: wei(freeMargin) };
		},
		{
			enabled: !!crossMarginAddress,
		}
	);
}
