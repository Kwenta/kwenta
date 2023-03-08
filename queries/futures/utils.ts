import { BigNumber } from '@ethersproject/bignumber';
import { ContractsMap } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

import { ETH_UNIT } from 'constants/network';
import { MarketClosureReason } from 'hooks/useMarketClosed';
import { SynthsTrades, SynthsVolumes } from 'queries/synths/type';

import { FuturesOpenInterest, FuturesOneMinuteStat } from './types';

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
	const synthVolumes: SynthsVolumes = {};
	const result = SynthTrades.synthExchanges
		.filter((i) => i.fromSynth !== null)
		.reduce((acc, curr) => {
			if (curr.fromSynth?.symbol) {
				acc[curr.fromSynth.symbol] = acc[curr.fromSynth.symbol]
					? wei(acc[curr.fromSynth.symbol]).add(curr.fromAmountInUSD)
					: wei(curr.fromAmountInUSD);
			}
			return acc;
		}, synthVolumes);
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
