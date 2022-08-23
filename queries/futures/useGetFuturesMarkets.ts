import synthetix, { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { chain, useAccount, useNetwork } from 'wagmi';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { appReadyState } from 'store/app';
import { futuresMarketsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset, getMarketName, MarketKeyByAsset } from 'utils/futures';

import { FuturesMarket } from './types';
import { getReasonFromCode } from './utils';

const useGetFuturesMarkets = (options?: UseQueryOptions<FuturesMarket[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { chain: activeChain } = useNetwork();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismKovan.id].includes(activeChain?.id)
			: false;
	const snxjs = synthetix({
		networkId: (activeChain?.unsupported
			? undefined
			: activeChain?.id ?? chain.optimism.id) as NetworkId,
	});
	const defaultSynthetixjs = synthetix({
		networkId: chain.optimism.id as NetworkId,
	});

	const homepage = window.location.pathname === ROUTES.Home.Root;
	const synthetixjs = homepage || !isL2 ? defaultSynthetixjs : snxjs;
	const networkId = homepage || !isL2 ? DEFAULT_NETWORK_ID : activeChain?.id;
	const { isConnected: isWalletConnected } = useAccount();
	const [, setFuturesMarkets] = useRecoilState(futuresMarketsState);
	const isReady = isAppReady && !!synthetixjs;

	return useQuery<FuturesMarket[]>(
		QUERY_KEYS.Futures.Markets(networkId as NetworkId),
		async () => {
			if (!homepage && isWalletConnected) {
				return null;
			}

			const {
				contracts: { FuturesMarketData, FuturesMarketSettings, SystemStatus, ExchangeRates },
				utils,
			} = synthetixjs!;

			const [markets, globals] = await Promise.all([
				FuturesMarketData.allMarketSummaries(),
				FuturesMarketData.globals(),
			]);

			const enabledMarkets = markets.filter((m: any) => {
				const asset = utils.parseBytes32String(m.asset) as FuturesMarketAsset;
				return !!MarketKeyByAsset[asset];
			});

			const assetKeys = enabledMarkets.map((m: any) => {
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

			const futuresMarkets = enabledMarkets.map(
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
