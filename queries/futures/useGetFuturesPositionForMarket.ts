import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';
import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition } from './utils';
import { FuturesPosition } from './types';

const useGetFuturesPositionForMarket = (
	asset: string | null,
	market: string | null,
	options?: QueryConfig<FuturesPosition>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<FuturesPosition>(
		QUERY_KEYS.Futures.Position(market || null, walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetix.js!;

			const getFuturesMarketContract = (asset: string | null) => {
				if (!asset) throw new Error(`Asset needs to be specified`);
				const contractName = `FuturesMarket${asset.substring(1)}`;
				const contract = synthetix.js!.contracts[contractName];
				if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
				return contract;
			};

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetails(market, walletAddress),
				getFuturesMarketContract(asset).canLiquidate(walletAddress),
			]);

			return mapFuturesPosition(futuresPosition, canLiquidatePosition);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && market,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
