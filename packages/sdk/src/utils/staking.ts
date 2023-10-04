import { wei } from '@synthetixio/wei'

import { ZERO_WEI } from '../constants/number'
import {
	DECAY_RATE,
	EPOCH_START,
	INITIAL_WEEKLY_SUPPLY,
	STAKING_ENDPOINTS,
	STAKING_REWARDS_RATIO,
	SUPPLY_RATE,
	WEEK,
} from '../constants/staking'
import { NetworkId } from '../types/common'

import { formatShortDate, toJSTimestamp } from './date'

export function getEpochDetails(networkId: number, epoch: number) {
	const currentEpochTime = EPOCH_START[networkId]
		? EPOCH_START[networkId] + WEEK * epoch
		: EPOCH_START[10]
	const epochEndTime = currentEpochTime + WEEK
	return { epochStart: currentEpochTime, epochEnd: epochEndTime }
}

export function getApy(totalStakedBalance: number, weekCounter: number) {
	const startWeeklySupply = wei(INITIAL_WEEKLY_SUPPLY).mul(SUPPLY_RATE.pow(weekCounter))
	const yearlyRewards = startWeeklySupply.mul(wei(1).sub(SUPPLY_RATE.pow(52))).div(wei(DECAY_RATE))
	return wei(totalStakedBalance).gt(0)
		? yearlyRewards.mul(wei(STAKING_REWARDS_RATIO)).div(wei(totalStakedBalance))
		: ZERO_WEI
}

export const parseEpochData = (index: number, networkId?: NetworkId) => {
	const { epochStart, epochEnd } = getEpochDetails(networkId ?? 10, index)
	const startDate = formatShortDate(new Date(toJSTimestamp(epochStart)))
	const endDate = formatShortDate(new Date(toJSTimestamp(epochEnd)))
	const label = `Epoch ${index}: ${startDate} - ${endDate}`
	return { period: index, start: epochStart, end: epochEnd, label }
}

export const getStakingGqlEndpoint = (networkId: number) => {
	return STAKING_ENDPOINTS[networkId] || STAKING_ENDPOINTS[10]
}
