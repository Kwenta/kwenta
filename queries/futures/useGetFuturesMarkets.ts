import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState } from 'recoil';
import { chain } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import useIsL2 from 'hooks/useIsL2';
import { setFuturesMarkets as setReduxFuturesMarkets } from 'state/futures/reducer';
import { serializeWeiObject } from 'state/helpers';
import { useAppDispatch } from 'state/hooks';
import { futuresMarketsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import {
	FuturesMarketAsset,
	getMarketName,
	MarketKeyByAsset,
	marketsForNetwork,
} from 'utils/futures';

import { FuturesMarket } from './types';
import { getReasonFromCode } from './utils';

const useGetFuturesMarkets = (options?: UseQueryOptions<FuturesMarket[]>) => {
	const { network: activeChain, defaultSynthetixjs, l2Synthetixjs } = Connector.useContainer();

	const homepage = window.location.pathname === ROUTES.Home.Root;
	const isL2 = useIsL2();
	const network = homepage || !isL2 ? chain.optimism : activeChain;
	const synthetixjs = homepage || !isL2 ? l2Synthetixjs : defaultSynthetixjs;
	const [, setFuturesMarkets] = useRecoilState(futuresMarketsState);
	const dispatch = useAppDispatch();

	return useQuery<FuturesMarket[]>(
		QUERY_KEYS.Futures.Markets(network?.id as NetworkId),
		async () => {
			if (!synthetixjs) {
				setFuturesMarkets([]);
				return null;
			}
			const enabledMarkets = marketsForNetwork(network.id as NetworkId);

			const {
				contracts: { FuturesMarketData, FuturesMarketSettings, SystemStatus, ExchangeRates },
				utils,
			} = synthetixjs!;

			const [markets, globals] = await Promise.all([
				FuturesMarketData.allMarketSummaries(),
				FuturesMarketData.globals(),
			]);

			const filteredMarkets = markets.filter((m: any) => {
				const asset = utils.parseBytes32String(m.asset) as FuturesMarketAsset;
				const market = enabledMarkets.find((market) => {
					return asset === market.asset;
				});
				return !!market;
			});

			const assetKeys = filteredMarkets.map((m: any) => {
				const asset = utils.parseBytes32String(m.asset) as FuturesMarketAsset;
				return utils.formatBytes32String(MarketKeyByAsset[asset]);
			});

			const currentRoundIdPromises = Promise.all(
				assetKeys.map((key: string) => ExchangeRates.getCurrentRoundId(key))
			);

			const marketLimitPromises = Promise.all(
				assetKeys.map((key: string) => FuturesMarketSettings.maxMarketValueUSD(key))
			);

			const systemStatusPromise = await SystemStatus.getFuturesMarketSuspensions(assetKeys);

			const [currentRoundIds, marketLimits, { suspensions, reasons }] = await Promise.all([
				currentRoundIdPromises,
				marketLimitPromises,
				systemStatusPromise,
			]);

			const futuresMarkets = filteredMarkets.map(
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
				): FuturesMarket => ({
					market,
					marketKey: MarketKeyByAsset[utils.parseBytes32String(asset) as FuturesMarketAsset],
					marketName: getMarketName(utils.parseBytes32String(asset) as FuturesMarketAsset),
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
					openInterest: {
						shortPct: wei(marketSize).eq(0)
							? 0
							: wei(marketSize).sub(marketSkew).div('2').div(marketSize).toNumber(),
						longPct: wei(marketSize).eq(0)
							? 0
							: wei(marketSize).add(marketSkew).div('2').div(marketSize).toNumber(),
						shortUSD: wei(marketSize).eq(0)
							? zeroBN
							: wei(marketSize).sub(marketSkew).div('2').mul(price),
						longUSD: wei(marketSize).eq(0)
							? zeroBN
							: wei(marketSize).add(marketSkew).div('2').mul(price),
					},
					marketDebt: wei(marketDebt),
					marketSkew: wei(marketSkew),
					maxLeverage: wei(maxLeverage),
					marketSize: wei(marketSize),
					marketLimit: wei(marketLimits[i]),
					price: wei(price),
					minInitialMargin: wei(globals.minInitialMargin),
					keeperDeposit: wei(globals.minKeeperFee),
					isSuspended: suspensions[i],
					marketClosureReason: getReasonFromCode(reasons[i]) as FuturesClosureReason,
				})
			);
			setFuturesMarkets(futuresMarkets);
			dispatch(setReduxFuturesMarkets(futuresMarkets.map(serializeWeiObject)));
			return futuresMarkets;
		},
		{
			enabled: !!synthetixjs,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
