import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { FuturesMarket } from './types';
import { getMarketKey } from 'utils/futures';
import { getReasonFromCode } from './utils';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import ROUTES from 'constants/routes';

const useGetFuturesMarkets = (options?: UseQueryOptions<FuturesMarket[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs: snxjs, defaultSynthetixjs } = Connector.useContainer();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const synthetixjs = homepage ? defaultSynthetixjs : snxjs;
	const networkId = homepage ? DEFAULT_NETWORK_ID : network.id;
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const isReady = isAppReady && !!synthetixjs;

	return useQuery<FuturesMarket[]>(
		QUERY_KEYS.Futures.Markets(networkId),
		async () => {
			if (!homepage && isWalletConnected && !isL2) {
				return null;
			}

			const {
				contracts: { FuturesMarketData, SystemStatus },
				utils,
			} = synthetixjs!;

			const [markets, globals] = await Promise.all([
				FuturesMarketData.allMarketSummaries(),
				FuturesMarketData.globals(),
			]);

			const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(
				markets.map((m: any) => {
					const asset = utils.parseBytes32String(m.asset);
					const marketKey = getMarketKey(asset, networkId);
					return utils.formatBytes32String(marketKey);
				})
			);

			return markets.map(
				(
					{
						market,
						asset,
						currentFundingRate,
						feeRates,
						marketDebt,
						marketSkew,
						maxLeverage,
						marketSize,
						price,
					}: FuturesMarket,
					i: number
				) => ({
					market: market,
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
					isSuspended: suspensions[i],
					marketClosureReason: getReasonFromCode(reasons[i]) as FuturesClosureReason,
				})
			);
		},
		{
			enabled: !homepage && isWalletConnected ? isL2 && isReady : isReady,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
