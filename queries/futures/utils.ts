import { BigNumber } from '@ethersproject/bignumber';
import { ContractsMap, NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { utils } from 'ethers';
import { parseBytes32String } from 'ethers/lib/utils';
import { chain } from 'wagmi';

import { ETH_UNIT } from 'constants/network';
import { MarketClosureReason } from 'hooks/useMarketClosed';
import { SynthsTrades, SynthsVolumes } from 'queries/synths/type';
import { FuturesMarket } from 'sdk/types/futures';
import { formatCurrency, formatDollars, weiFromWei } from 'utils/formatters/number';
import {
	FuturesMarketAsset,
	getDisplayAsset,
	getMarketName,
	MarketKeyByAsset,
} from 'utils/futures';

import { SECONDS_PER_DAY, FUTURES_ENDPOINTS } from './constants';
import {
	CrossMarginAccountTransferResult,
	FuturesMarginTransferResult,
	FuturesOrderResult,
	FuturesOrderType,
	FuturesPositionResult,
	FuturesTradeResult,
} from './subgraph';
import {
	FuturesOpenInterest,
	FuturesOneMinuteStat,
	PositionSide,
	PositionHistory,
	FundingRateUpdate,
	FuturesTrade,
	MarginTransfer,
	FuturesOrder,
	FuturesOrderTypeDisplay,
} from './types';

export const getFuturesEndpoint = (networkId: NetworkId): string => {
	return FUTURES_ENDPOINTS[networkId] || FUTURES_ENDPOINTS[chain.optimism.id];
};

export const getFuturesMarketContract = (asset: string | null, contracts: ContractsMap) => {
	if (!asset) throw new Error(`Asset needs to be specified`);
	const contractName = `FuturesMarket${asset[0] === 's' ? asset.substring(1) : asset}`;
	const contract = contracts[contractName];
	if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
	return contract;
};

const mapOrderType = (orderType: Partial<FuturesOrderType>): FuturesOrderTypeDisplay => {
	return orderType === 'NextPrice'
		? 'Next Price'
		: orderType === 'StopMarket'
		? 'Stop Market'
		: orderType;
};

export const mapFuturesOrders = (
	o: FuturesOrderResult,
	marketInfo: FuturesMarket | undefined
): FuturesOrder => {
	const asset: FuturesMarketAsset = parseBytes32String(o.asset) as FuturesMarketAsset;
	const size = weiFromWei(o.size);
	const targetPrice = weiFromWei(o.targetPrice ?? 0);
	const targetRoundId = new Wei(o.targetRoundId, 0);
	const currentRoundId = wei(marketInfo?.currentRoundId ?? 0);
	const marginDelta = weiFromWei(o.marginDelta);
	return {
		...o,
		asset,
		targetRoundId,
		marginDelta,
		targetPrice: targetPrice.gt(0) ? targetPrice : null,
		size: size,
		market: getMarketName(asset),
		marketKey: MarketKeyByAsset[asset],
		orderType: mapOrderType(o.orderType),
		sizeTxt: formatCurrency(asset, size.abs(), {
			currencyKey: getDisplayAsset(asset) ?? '',
			minDecimals: size.abs().lt(0.01) ? 4 : 2,
		}),
		targetPriceTxt: formatDollars(targetPrice),
		side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
		isStale: o.orderType === 'NextPrice' && currentRoundId.gte(wei(o.targetRoundId).add(2)),
		isExecutable:
			o.orderType === 'NextPrice' && targetRoundId
				? currentRoundId.eq(targetRoundId) || currentRoundId.eq(targetRoundId.add(1))
				: false,
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
				totalVolume: acc.totalVolume.add(stat.volume.div(ETH_UNIT).abs()),
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
			const amount = `${isPositive ? '+' : '-'}${formatDollars(cleanSize)}`;
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

export const mapCrossMarginTransfers = (
	marginTransfers: CrossMarginAccountTransferResult[]
): MarginTransfer[] => {
	return marginTransfers?.map(
		({ timestamp, account, size, txHash }: CrossMarginAccountTransferResult): MarginTransfer => {
			const sizeWei = new Wei(size);
			const cleanSize = sizeWei.div(ETH_UNIT).abs();
			const isPositive = sizeWei.gt(0);
			const amount = `${isPositive ? '+' : '-'}${formatDollars(cleanSize)}`;
			const numTimestamp = wei(timestamp).toNumber();

			return {
				timestamp: numTimestamp,
				account,
				size,
				action: isPositive ? 'deposit' : 'withdraw',
				amount,
				isPositive,
				txHash,
			};
		}
	);
};

export const mapFuturesPositions = (
	futuresPositions: FuturesPositionResult[]
): PositionHistory[] => {
	return futuresPositions.map(
		({
			id,
			lastTxHash,
			openTimestamp,
			closeTimestamp,
			timestamp,
			market,
			asset,
			account,
			abstractAccount,
			accountType,
			isOpen,
			isLiquidated,
			trades,
			totalVolume,
			size,
			initialMargin,
			margin,
			pnl,
			feesPaid,
			netFunding,
			pnlWithFeesPaid,
			netTransfers,
			totalDeposits,
			entryPrice,
			avgEntryPrice,
			exitPrice,
		}: FuturesPositionResult) => {
			const entryPriceWei = weiFromWei(entryPrice);
			const feesWei = weiFromWei(feesPaid || 0);
			const sizeWei = weiFromWei(size);
			const marginWei = weiFromWei(margin);
			return {
				id: Number(id.split('-')[1].toString()),
				transactionHash: lastTxHash,
				timestamp: timestamp.mul(1000).toNumber(),
				openTimestamp: openTimestamp.mul(1000).toNumber(),
				closeTimestamp: closeTimestamp?.mul(1000).toNumber(),
				market,
				asset: utils.parseBytes32String(asset) as FuturesMarketAsset,
				account,
				abstractAccount,
				accountType,
				isOpen,
				isLiquidated,
				size: sizeWei.abs(),
				feesPaid: feesWei,
				netFunding: weiFromWei(netFunding || 0),
				netTransfers: weiFromWei(netTransfers || 0),
				totalDeposits: weiFromWei(totalDeposits || 0),
				initialMargin: weiFromWei(initialMargin),
				margin: marginWei,
				entryPrice: entryPriceWei,
				exitPrice: weiFromWei(exitPrice || 0),
				pnl: weiFromWei(pnl),
				pnlWithFeesPaid: weiFromWei(pnlWithFeesPaid),
				totalVolume: weiFromWei(totalVolume),
				trades: trades.toNumber(),
				avgEntryPrice: weiFromWei(avgEntryPrice),
				leverage: marginWei.eq(wei(0)) ? wei(0) : sizeWei.mul(entryPriceWei).div(marginWei).abs(),
				side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
			};
		}
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
			accountType,
		}: FuturesTradeResult) => {
			return {
				asset,
				accountType,
				size: new Wei(size, 18, true),
				price: new Wei(price, 18, true),
				txnHash: id.split('-')[0].toString(),
				timestamp: timestamp,
				positionSize: new Wei(positionSize, 18, true),
				positionClosed,
				side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
				pnl: new Wei(pnl, 18, true),
				feesPaid: new Wei(feesPaid, 18, true),
				orderType: mapOrderType(orderType),
			};
		}
	);
};
