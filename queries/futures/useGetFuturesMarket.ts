import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { FuturesMarket } from './types';
import { getMarketKey } from 'utils/futures';
import { getReasonFromCode } from './utils';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { currentMarketState, marketInfoState } from 'store/futures';

const useGetFuturesMarket = (options?: UseQueryOptions<FuturesMarket | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const currentMarket = useRecoilValue(currentMarketState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const [, setMarketInfo] = useRecoilState(marketInfoState);

	const { synthetixjs } = Connector.useContainer();

	const isReady = isAppReady && !!synthetixjs;

	return useQuery<FuturesMarket | null>(
		QUERY_KEYS.Futures.Market(network.id, currentMarket),
		async () => {
			if (isWalletConnected && !isL2) {
				return null;
			}

			const {
				contracts: { FuturesMarketData, SystemStatus },
				utils,
			} = synthetixjs!;

			const marketKey = getMarketKey(currentMarket, network.id);

			const [markets, globals, { suspended, reason }] = await Promise.all([
				FuturesMarketData.marketSummariesForKeys([utils.formatBytes32String(marketKey)]),
				FuturesMarketData.globals(),
				SystemStatus.futuresMarketSuspension(utils.formatBytes32String(marketKey)),
			]);

			const market = markets[0];

			const {
				market: m,
				asset,
				currentFundingRate,
				feeRates,
				marketDebt,
				marketSkew,
				maxLeverage,
				marketSize,
				price,
			}: FuturesMarket = market;

			const parsedMarket = {
				market: m,
				asset: utils.parseBytes32String(asset),
				assetHex: asset,
				currentFundingRate: wei(currentFundingRate).mul(-1),
				feeRates: {
					makerFee: wei(feeRates.makerFee),
					takerFee: wei(feeRates.takerFee),
				},
				marketDebt: wei(marketDebt),
				marketSkew: wei(marketSkew),
				maxLeverage: wei(maxLeverage),
				marketSize: wei(marketSize),
				price: wei(price),
				minInitialMargin: wei(globals.minInitialMargin),
				isSuspended: suspended,
				marketClosureReason: getReasonFromCode(reason) as FuturesClosureReason,
			};

			setMarketInfo(parsedMarket);

			return parsedMarket;
		},
		{
			enabled: isWalletConnected ? isL2 && isReady : isReady,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesMarket;
