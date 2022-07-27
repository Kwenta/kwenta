import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { appReadyState } from 'store/app';
import { futuresMarketsState } from 'store/futures';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

import { FuturesMarket } from './types';
import { getReasonFromCode } from './utils';

const useGetFuturesMarkets = (options?: UseQueryOptions<FuturesMarket[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs: snxjs, defaultSynthetixjs } = Connector.useContainer();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const synthetixjs = homepage ? defaultSynthetixjs : snxjs;
	const networkId = homepage ? DEFAULT_NETWORK_ID : network.id;
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const [, setFuturesMarkets] = useRecoilState(futuresMarketsState);
	const isReady = isAppReady && !!synthetixjs;

	return useQuery<FuturesMarket[]>(
		QUERY_KEYS.Futures.Markets(networkId),
		async () => {
			if (!homepage && isWalletConnected && !isL2) {
				return null;
			}

			const {
				contracts: { FuturesMarketData, SystemStatus, ExchangeRates },
				utils,
			} = synthetixjs!;

			const [markets, globals] = await Promise.all([
				FuturesMarketData.allMarketSummaries(),
				FuturesMarketData.globals(),
			]);

			const assetKeys = markets.map((m: any) => {
				const asset = utils.parseBytes32String(m.asset) as FuturesMarketAsset;
				return utils.formatBytes32String(MarketKeyByAsset[asset]);
			});

			const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(assetKeys);
			const currentRoundIds = await Promise.all(
				assetKeys.map((key: string) => ExchangeRates.getCurrentRoundId(key))
			);

			const futuresMarkets = markets.map(
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
					market,
					asset: utils.parseBytes32String(asset) as FuturesMarketAsset,
					assetHex: asset,
					currentFundingRate: wei(currentFundingRate).neg(),
					currentRoundId: wei(currentRoundIds[i], 0),
					feeRates: {
						makerFee: wei(feeRates.makerFee),
						takerFee: wei(feeRates.takerFee),
						makerFeeNextPrice: wei(feeRates.makerFeeNextPrice),
						takerFeeNextPrice: wei(feeRates.takerFeeNextPrice),
					},
					marketDebt: wei(marketDebt),
					marketSkew: wei(marketSkew),
					maxLeverage: wei(maxLeverage),
					marketSize: wei(marketSize),
					price: wei(price),
					minInitialMargin: wei(globals.minInitialMargin),
					keeperDeposit: wei(globals.minKeeperFee),
					isSuspended: suspensions[i],
					marketClosureReason: getReasonFromCode(reasons[i]) as FuturesClosureReason,
				})
			);

			setFuturesMarkets(futuresMarkets);

			return futuresMarkets;
		},
		{
			enabled: !homepage && isWalletConnected ? isL2 && isReady : isReady,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
