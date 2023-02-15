import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';

import { formatShortDate, toJSTimestamp } from 'utils/formatters/date';
import { zeroBN } from 'utils/formatters/number';

export type TradingRewardProps = {
	period: number | string;
	start?: number;
	end?: number;
};

export type EpochDataProps = {
	merkleRoot: string;
	tokenTotal: string;
	claims: {
		[address: string]: {
			index: number;
			amount: string;
			proof: string[];
		};
	};
};

export type FuturesFeeForAccountProps = {
	timestamp: number;
	account: string;
	abstractAccount: string;
	accountType: string;
	feesPaid: BigNumber;
};

export type FuturesFeeProps = {
	timestamp: string;
	feesSynthetix: BigNumber;
};

export type ClaimParams = [number, string, string, string[], number];

export const EPOCH_START: Record<number, number> = {
	420: 1665878400,
	10: 1668556800,
};

export const WEEK = 604800;
export const DECAY_RATE = 0.0205;
export const INITIAL_WEEKLY_SUPPLY = BigNumber.from('14463369230769230769230');
export const STAKING_REWARDS_RATIO = 0.6;
export const TRADING_REWARDS_RATIO = 0.05;
export const STAKING_HIGH_GAS_LIMIT = BigNumber.from('400000');
export const STAKING_LOW_GAS_LIMIT = BigNumber.from('200000');

const SUPPLY_RATE = wei(1).sub(wei(DECAY_RATE));

export function getEpochDetails(networkId: number, epoch: number) {
	const currentEpochTime = EPOCH_START[networkId]
		? EPOCH_START[networkId] + WEEK * epoch
		: EPOCH_START[10];
	const epochEndTime = currentEpochTime + WEEK;
	return { epochStart: currentEpochTime, epochEnd: epochEndTime };
}

export function getApy(totalStakedBalance: number, weekCounter: number) {
	const startWeeklySupply = wei(INITIAL_WEEKLY_SUPPLY).mul(SUPPLY_RATE.pow(weekCounter));
	const yearlyRewards = startWeeklySupply.mul(wei(1).sub(SUPPLY_RATE.pow(52))).div(wei(DECAY_RATE));
	return wei(totalStakedBalance).gt(0)
		? yearlyRewards.mul(wei(STAKING_REWARDS_RATIO)).div(wei(totalStakedBalance))
		: zeroBN;
}

export const parseEpochData = (index: number, networkId?: NetworkId) => {
	const { epochStart, epochEnd } = getEpochDetails(networkId ?? 10, index);
	const startDate = formatShortDate(new Date(toJSTimestamp(epochStart)));
	const endDate = formatShortDate(new Date(toJSTimestamp(epochEnd)));
	const label = `Epoch ${index}: ${startDate} - ${endDate}`;
	return { period: index, start: epochStart, end: epochEnd, label };
};
