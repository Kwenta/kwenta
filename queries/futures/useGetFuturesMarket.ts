import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { appReadyState } from 'store/app';
import { marketInfoState, marketKeyState } from 'store/futures';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import { FuturesMarketAsset } from 'utils/futures';

import { FuturesMarket } from './types';
import { getReasonFromCode } from './utils';

const useGetFuturesMarket = (options?: UseQueryOptions<FuturesMarket | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const marketKey = useRecoilValue(marketKeyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const setMarketInfo = useSetRecoilState(marketInfoState);

	const { synthetixjs } = Connector.useContainer();

	const isReady = isAppReady && !!synthetixjs;

	return useQuery<FuturesMarket | null>(
		QUERY_KEYS.Futures.Market(network.id, marketKey),
		async () => {
			if (isWalletConnected && !isL2) {
				return null;
			}

			const {
				contracts: { FuturesMarketData, FuturesMarketSettings, SystemStatus },
				utils,
			} = synthetixjs!;

			const [markets, globals, { suspended, reason }, marketLimit] = await Promise.all([
				FuturesMarketData.marketSummariesForKeys([utils.formatBytes32String(marketKey)]),
				FuturesMarketData.globals(),
				SystemStatus.futuresMarketSuspension(utils.formatBytes32String(marketKey)),
				FuturesMarketSettings.maxMarketValueUSD(utils.formatBytes32String(marketKey)),
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
				asset: utils.parseBytes32String(asset) as FuturesMarketAsset,
				assetHex: asset,
				currentFundingRate: wei(currentFundingRate).neg(),
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
				marketLimit: wei(marketLimit),
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
