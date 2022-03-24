import Wei, { wei } from '@synthetixio/wei';
import { ContractsMap } from '@synthetixio/contracts-interface/build/node/src/types';
import { BigNumber } from '@ethersproject/bignumber';
import { utils } from '@synthetixio/contracts-interface/node_modules/ethers';

import { zeroBN } from 'utils/formatters/number';
import {
	FuturesPosition,
	FuturesOpenInterest,
	FuturesOneMinuteStat,
	PositionDetail,
	PositionSide,
	FuturesTrade,
	FuturesVolumes,
	RawPosition,
	PositionHistory,
} from './types';

export const getFuturesMarketContract = (asset: string | null, contracts: ContractsMap) => {
	if (!asset) throw new Error(`Asset needs to be specified`);
	const contractName = `FuturesMarket${asset.substring(1)}`;
	const contract = contracts[contractName];
	if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
	return contract;
};

export const mapFuturesPosition = (
	positionDetail: PositionDetail,
	canLiquidatePosition: boolean,
	asset: string
): FuturesPosition => {
	const {
		remainingMargin,
		accessibleMargin,
		orderPending,
		order,
		position: { fundingIndex, lastPrice, size, margin },
		accruedFunding,
		notionalValue,
		liquidationPrice,
		profitLoss,
	} = positionDetail;
	const roi = wei(profitLoss).add(wei(accruedFunding));
	return {
		asset,
		order: !!orderPending
			? {
					pending: !!orderPending,
					fee: wei(order.fee),
					leverage: wei(order.leverage),
					side: wei(order.leverage).gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
			  }
			: null,
		remainingMargin: wei(remainingMargin),
		accessibleMargin: wei(accessibleMargin),
		position: wei(size).eq(zeroBN)
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					side: wei(size).gt(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					notionalValue: wei(notionalValue),
					accruedFunding: wei(accruedFunding),
					initialMargin: wei(margin),
					profitLoss: wei(profitLoss),
					fundingIndex: Number(fundingIndex),
					lastPrice: wei(lastPrice),
					size: wei(size).abs(),
					liquidationPrice: wei(liquidationPrice),
					initialLeverage: wei(size).mul(wei(lastPrice)).div(wei(margin)).abs(),
					roi,
					roiChange: wei(margin).eq(zeroBN) ? zeroBN : roi.div(wei(margin)),
					marginRatio: wei(notionalValue).eq(zeroBN)
						? zeroBN
						: wei(remainingMargin).div(wei(notionalValue).abs()),
					leverage: wei(remainingMargin).eq(zeroBN)
						? zeroBN
						: wei(notionalValue).div(wei(remainingMargin)).abs(),
			  },
	};
};

type MarketSizes = {
	short: BigNumber;
	long: BigNumber;
};

export const mapOpenInterest = async (
	keys: string[],
	contracts: ContractsMap
): Promise<FuturesOpenInterest[]> => {
	const openInterest: FuturesOpenInterest[] = [];
	for (const key of keys) {
		const contract = contracts[`FuturesMarket${key.substr(1)}`];
		if (contract) {
			const marketSizes: MarketSizes = await contract.marketSizes();
			const shortSize = wei(marketSizes.short);
			const longSize = wei(marketSizes.long);

			if (shortSize.toNumber() === 0 && longSize.toNumber() === 0) {
				openInterest.push({
					asset: key,
					ratio: {
						long: 0.5,
						short: 0.5,
					},
				});
			} else if (shortSize.toNumber() === 0 || longSize.toNumber() === 0) {
				openInterest.push({
					asset: key,
					ratio: {
						long: shortSize.toNumber() === 0 ? 1 : 0,
						short: longSize.toNumber() === 0 ? 1 : 0,
					},
				});
			} else {
				const longsBigger = longSize.gt(shortSize);
				const combined = shortSize.add(longSize);

				openInterest.push({
					asset: key,
					ratio: {
						long: longSize.div(combined).toNumber(),
						short: shortSize.div(combined).toNumber(),
					},
				});
			}
		}
	}
	return openInterest;
};

export const calculateTradeVolume = (futuresTrades: FuturesTrade[]): Wei => {
	return futuresTrades.reduce(
		(acc: Wei, { size, price }: FuturesTrade) => {
			const cleanSize = new Wei(size, 18, true).abs()
			const cleanPrice = new Wei(price, 18, true)
			return acc.add(cleanSize.mul(cleanPrice));
		},
		wei(0)
	);
};

export const calculateTradeVolumeForAll = (futuresTrades: FuturesTrade[]): FuturesVolumes => {
	const volumes = {} as FuturesVolumes;

	futuresTrades.forEach(({ asset, size, price }) => {
		const sizeAdd = new Wei(size, 18, true);
		const priceAdd = new Wei(price, 18, true);
		const volumeAdd = sizeAdd.mul(priceAdd).abs();

		volumes[asset] ?
			volumes[asset] = volumes[asset].add(volumeAdd)
		:
			volumes[asset] = volumeAdd
	})
	return volumes;
};

export const calculateDailyTradeStats = (futuresTrades: FuturesOneMinuteStat[]) => {
	return futuresTrades.reduce(
		(acc, stat) => {
			return {
				totalVolume: acc.totalVolume.add(new Wei(stat.volume, 18, true).abs()),
				totalTrades: acc.totalTrades + Number(stat.trades),
			};
		},
		{
			totalTrades: 0,
			totalVolume: wei(0),
		}
	);
};

export const mapTradeHistory = (futuresPositions: RawPosition[], openOnly: boolean): PositionHistory[] => {
	return (
		futuresPositions
			?.map(
				({
					id,
					lastTxHash,
					timestamp,
					market,
					asset,
					account,
					isOpen,
					isLiquidated,
					size,
					feesPaid,
					margin,
					entryPrice,
					exitPrice
				}: RawPosition) => {
					const entryPriceWei = new Wei(entryPrice, 18, true);
					const exitPriceWei = new Wei(exitPrice || 0, 18, true);
					const sizeWei = new Wei(size, 18, true);
					const feesWei = new Wei(feesPaid, 18, true);
					const marginWei = new Wei(margin, 18, true);
					return {
						id: Number(id.split('-')[1].toString()),
						transactionHash: lastTxHash,
						timestamp: timestamp * 1000,
						market: market,
						asset: utils.parseBytes32String(asset),
						account: account,
						isOpen,
						isLiquidated,
						size: sizeWei.abs(),
						feesPaid: feesWei,
						margin: marginWei,
						entryPrice: entryPriceWei,
						exitPrice: exitPriceWei,
						leverage: marginWei.eq(wei(0))
							? wei(0)
							: sizeWei.mul(entryPriceWei).div(marginWei).abs(),
						side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
						pnl: sizeWei.mul(exitPriceWei.sub(entryPriceWei)),
					};
				}
			)
			.filter(({ isOpen }: { isOpen: boolean }) => {
				if(openOnly) {
					return isOpen;
				} else {
					return true;
				}
			})
			.filter(({ id }: { id: number }) => id !== 0) ?? null
	);
};
