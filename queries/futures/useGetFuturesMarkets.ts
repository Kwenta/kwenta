import synthetix, { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState } from 'recoil';
import { chain, useAccount, useNetwork, useProvider } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import useIsL2 from 'hooks/useIsL2';
import { futuresMarketsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset, getMarketName, MarketKeyByAsset } from 'utils/futures';

import { FuturesMarket } from './types';
import { getReasonFromCode } from './utils';

const useGetFuturesMarkets = (options?: UseQueryOptions<FuturesMarket[]>) => {
	const { chain: activeChain } = useNetwork();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const isL2 = useIsL2(activeChain?.id as NetworkId);
	const network = homepage || isL2 ? chain.optimism : activeChain;
	const provider = useProvider({ chainId: network?.id });
	const synthetixjs = synthetix({
		provider: provider,
		networkId: network?.id as NetworkId,
	});

	const { isConnected: isWalletConnected } = useAccount();
	const [, setFuturesMarkets] = useRecoilState(futuresMarketsState);

	return useQuery<FuturesMarket[]>(
		QUERY_KEYS.Futures.Markets(network?.id as NetworkId),
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
			enabled: !homepage && isWalletConnected ? isL2 && !!synthetixjs : !!synthetixjs,
			refetchInterval: 15000,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
