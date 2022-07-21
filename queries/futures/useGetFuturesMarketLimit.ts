import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

const useGetFuturesMarketLimit = (market: string | null) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery(
		QUERY_KEYS.Futures.MarketLimit(network.id, market || null),
		async () => {
			const {
				contracts: { FuturesMarketSettings },
			} = synthetixjs!;
			if (!market) return null;

			const maxMarketValueUSD = await FuturesMarketSettings.maxMarketValueUSD(
				ethersUtils.formatBytes32String(market)
			);

			return wei(maxMarketValueUSD);
		},
		{
			enabled: isAppReady && isL2 && !!market && !!synthetixjs,
		}
	);
};

export default useGetFuturesMarketLimit;
