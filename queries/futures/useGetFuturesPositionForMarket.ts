import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition } from './utils';
import { FuturesPosition } from './types';

const useGetFuturesPositionForMarket = (
	asset: string | null,
	market: string | null,
	options?: UseQueryOptions<FuturesPosition | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<FuturesPosition | null>(
		QUERY_KEYS.Futures.Position(market || null, walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!market) return null;
			const getFuturesMarketContract = (asset: string | null) => {
				if (!asset) throw new Error(`Asset needs to be specified`);
				const contractName = `FuturesMarket${asset.substring(1)}`;
				const contract = synthetixjs!.contracts[contractName];
				if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
				return contract;
			};

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetails(market, walletAddress),
				getFuturesMarketContract(asset).canLiquidate(walletAddress),
			]);

			return mapFuturesPosition(futuresPosition, canLiquidatePosition, market);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!market && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
