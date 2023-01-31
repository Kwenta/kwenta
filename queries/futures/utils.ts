import { BigNumber } from '@ethersproject/bignumber';
import { ContractsMap, NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { utils } from 'ethers';
import { chain } from 'wagmi';

import { ETH_UNIT } from 'constants/network';
import { MarketClosureReason } from 'hooks/useMarketClosed';
import { SynthsTrades, SynthsVolumes } from 'queries/synths/type';
import { formatDollars } from 'utils/formatters/number';
import { FuturesMarketAsset } from 'utils/futures';

import { SECONDS_PER_DAY, FUTURES_ENDPOINTS } from './constants';
import { CrossMarginAccountTransferResult, FuturesMarginTransferResult } from './subgraph';
import {
	FuturesOpenInterest,
	FuturesOneMinuteStat,
	FundingRateUpdate,
	MarginTransfer,
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
