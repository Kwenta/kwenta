import { BigNumber } from '@ethersproject/bignumber';
import { Synths } from '@synthetixio/contracts-interface';
import { ContractsMap } from '@synthetixio/contracts-interface/build/node/src/types';
import Wei, { wei } from '@synthetixio/wei';
import { utils } from 'ethers';

import { ETH_UNIT } from 'constants/network';
import { MarketClosureReason } from 'hooks/useMarketClosed';
import { SynthsTrades, SynthsVolumes } from 'queries/synths/type';
import { Network } from 'store/wallet';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset } from 'utils/futures';

import { FUTURES_ENDPOINT_MAINNET, FUTURES_ENDPOINT_TESTNET, SECONDS_PER_DAY } from './constants';
import { FuturesMarginTransferResult, FuturesTradeResult } from './subgraph';
import {
	FuturesPosition,
	FuturesOpenInterest,
	FuturesOneMinuteStat,
	PositionDetail,
	PositionSide,
	FuturesVolumes,
	RawPosition,
	PositionHistory,
	FundingRateUpdate,
	FuturesTrade,
	MarginTransfer,
} from './types';

export const getFuturesEndpoint = (network: Network): string => {
	return network && network.id === 10
		? FUTURES_ENDPOINT_MAINNET
		: network.id === 69
		? FUTURES_ENDPOINT_TESTNET
		: FUTURES_ENDPOINT_MAINNET;
};

export const getFuturesMarketContract = (asset: string | null, contracts: ContractsMap) => {
	if (!asset) throw new Error(`Asset needs to be specified`);
	const contractName = `FuturesMarket${asset[0] === 's' ? asset.substring(1) : asset}`;
	const contract = contracts[contractName];
	if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
	return contract;
};

export const mapFuturesPosition = (
	positionDetail: PositionDetail,
	canLiquidatePosition: boolean,
	asset: FuturesMarketAsset
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

export const calculateTradeVolume = (futuresTrades: FuturesTradeResult[]): Wei => {
	return futuresTrades.reduce((acc: Wei, { size, price }: FuturesTradeResult) => {
		const cleanSize = new Wei(size).div(ETH_UNIT).abs();
		const cleanPrice = new Wei(price).div(ETH_UNIT);
		return acc.add(cleanSize.mul(cleanPrice));
	}, wei(0));
};

export const calculateTradeVolumeForAll = (futuresTrades: FuturesTradeResult[]): FuturesVolumes => {
	const volumes = {} as FuturesVolumes;

	futuresTrades.forEach(({ asset, size, price }) => {
		const sizeAdd = new Wei(size).div(ETH_UNIT);
		const priceAdd = new Wei(price).div(ETH_UNIT);
		const volumeAdd = sizeAdd.mul(priceAdd).abs();

		volumes[asset]
			? (volumes[asset] = volumes[asset].add(volumeAdd))
			: (volumes[asset] = volumeAdd);
	});
	return volumes;
};

export const calculateTradeVolumeForAllSynths = (SynthTrades: SynthsTrades): SynthsVolumes => {
	const result = SynthTrades.synthExchanges
		.filter((i) => i.fromSynth !== null)
		.reduce((acc: any, curr: any) => {
			if (curr.fromSynth.symbol) {
				acc[curr.fromSynth.symbol] = acc[curr.fromSynth.symbol]
					? acc[curr.fromSynth.symbol] + Number(curr.fromAmountInUSD)
					: Number(curr.fromAmountInUSD);
			}
			return acc;
		}, {});
	return result;
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

export const calculateFundingRate = (
	minTimestamp: number,
	periodLength: number,
	fundingRates: FundingRateUpdate[],
	assetPrice: Wei,
	currentFundingRate: Wei
): Wei | null => {
	const numUpdates = fundingRates.length;
	if (numUpdates < 2) return null;

	// variables to keep track
	let fundingPaid = wei(0);
	let timeTotal = 0;
	let lastTimestamp = minTimestamp;

	// iterate through funding updates
	for (let ind = 0; ind < numUpdates - 1; ind++) {
		const minFunding = fundingRates[ind];
		const maxFunding = fundingRates[ind + 1];

		const fundingStart = new Wei(minFunding.funding, 18, true);
		const fundingEnd = new Wei(maxFunding.funding, 18, true);

		const fundingDiff = fundingStart.sub(fundingEnd);
		const timeDiff = maxFunding.timestamp - Math.max(minFunding.timestamp, lastTimestamp);
		const timeMax = maxFunding.timestamp - minFunding.timestamp;

		if (timeMax > 0) {
			fundingPaid = fundingPaid.add(fundingDiff.mul(timeDiff).div(timeMax));
			timeTotal += timeDiff;
		}
		lastTimestamp = maxFunding.timestamp;
	}

	// add funding from current rate
	const timeLeft = Math.max(periodLength - timeTotal, 0);
	if (timeLeft > 0) {
		fundingPaid = fundingPaid.add(
			wei(currentFundingRate).mul(timeLeft).div(SECONDS_PER_DAY).mul(assetPrice)
		);
	}

	const fundingRate = fundingPaid.div(assetPrice);
	return fundingRate;
};

export const getReasonFromCode = (
	reasonCode?: BigNumber
): MarketClosureReason | 'unknown' | null => {
	switch (Number(reasonCode)) {
		case 1:
			return 'system-upgrade';
		case 2:
			return 'market-closure';
		case 3:
		case 55:
		case 65:
		case 231:
			return 'circuit-breaker';
		case 99999:
			return 'emergency';
		default:
			return 'unknown';
	}
};

export const mapMarginTransfers = (
	marginTransfers: FuturesMarginTransferResult[]
): MarginTransfer[] => {
	return marginTransfers?.map(
		({
			timestamp,
			account,
			market,
			size,
			asset,
			txHash,
		}: FuturesMarginTransferResult): MarginTransfer => {
			const sizeWei = new Wei(size);
			const cleanSize = sizeWei.div(ETH_UNIT).abs();
			const isPositive = sizeWei.gt(0);
			const amount = `${isPositive ? '+' : '-'}${formatCurrency(Synths.sUSD, cleanSize, {
				sign: '$',
			})}`;
			const numTimestamp = wei(timestamp).toNumber();

			return {
				timestamp: numTimestamp,
				account,
				market,
				size,
				action: isPositive ? 'deposit' : 'withdraw',
				amount,
				isPositive,
				asset: utils.parseBytes32String(asset) as FuturesMarketAsset,
				txHash,
			};
		}
	);
};

export const mapTradeHistory = (
	futuresPositions: RawPosition[],
	openOnly: boolean
): PositionHistory[] => {
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
					netFunding,
					netTransfers,
					totalDeposits,
					initialMargin,
					margin,
					entryPrice,
					exitPrice,
					pnl,
					pnlWithFeesPaid,
					openTimestamp,
					closeTimestamp,
					totalVolume,
					trades,
					avgEntryPrice,
				}: RawPosition) => {
					const entryPriceWei = new Wei(entryPrice, 18, true);
					const exitPriceWei = new Wei(exitPrice || 0, 18, true);
					const sizeWei = new Wei(size, 18, true);
					const feesWei = new Wei(feesPaid || 0, 18, true);
					const netFundingWei = new Wei(netFunding || 0, 18, true);
					const netTransfersWei = new Wei(netTransfers || 0, 18, true);
					const totalDepositsWei = new Wei(totalDeposits || 0, 18, true);
					const initialMarginWei = new Wei(initialMargin, 18, true);
					const marginWei = new Wei(margin, 18, true);
					const pnlWei = new Wei(pnl, 18, true);
					const pnlWithFeesPaidWei = new Wei(pnlWithFeesPaid, 18, true);
					const totalVolumeWei = new Wei(totalVolume, 18, true);
					const avgEntryPriceWei = new Wei(avgEntryPrice, 18, true);
					return {
						id: Number(id.split('-')[1].toString()),
						transactionHash: lastTxHash,
						timestamp: timestamp * 1000,
						openTimestamp: openTimestamp * 1000,
						closeTimestamp: closeTimestamp * 1000,
						market,
						asset: utils.parseBytes32String(asset) as FuturesMarketAsset,
						account,
						isOpen,
						isLiquidated,
						size: sizeWei.abs(),
						feesPaid: feesWei,
						netFunding: netFundingWei,
						netTransfers: netTransfersWei,
						totalDeposits: totalDepositsWei,
						initialMargin: initialMarginWei,
						margin: marginWei,
						entryPrice: entryPriceWei,
						exitPrice: exitPriceWei,
						pnl: pnlWei,
						pnlWithFeesPaid: pnlWithFeesPaidWei,
						totalVolume: totalVolumeWei,
						trades,
						avgEntryPrice: avgEntryPriceWei,
						leverage: marginWei.eq(wei(0))
							? wei(0)
							: sizeWei.mul(entryPriceWei).div(marginWei).abs(),
						side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
					};
				}
			)
			.filter(({ isOpen }: { isOpen: boolean }) => {
				if (openOnly) {
					return isOpen;
				} else {
					return true;
				}
			})
			.filter(({ id }: { id: number }) => id !== 0) ?? null
	);
};

export const mapTrades = (futuresTrades: FuturesTradeResult[]): FuturesTrade[] => {
	return futuresTrades?.map(
		({
			id,
			timestamp,
			size,
			price,
			asset,
			positionSize,
			positionClosed,
			pnl,
			feesPaid,
			orderType,
		}: FuturesTradeResult) => {
			return {
				size: new Wei(size, 18, true),
				asset: asset,
				price: new Wei(price, 18, true),
				txnHash: id.split('-')[0].toString(),
				timestamp: timestamp,
				positionSize: new Wei(positionSize, 18, true),
				positionClosed,
				side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
				pnl: new Wei(pnl, 18, true),
				feesPaid: new Wei(feesPaid, 18, true),
				orderType: orderType,
			};
		}
	);
};
