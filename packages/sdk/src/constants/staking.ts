import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'

export const DEFAULT_NUMBER_OF_FUTURES_FEE: number = 9999

export const EPOCH_START: Record<number, number> = {
	420: 1665878400,
	10: 1668556800,
}

export const WEEK = 604800
export const VESTING_ENTRY_PAGE_SIZE = 999999
export const DECAY_RATE = 0.0205
export const INITIAL_WEEKLY_SUPPLY = BigNumber.from('14463369230769230769230')
export const STAKING_REWARDS_RATIO = 0.6
export const TRADING_REWARDS_RATIO = 0.05
export const STAKING_HIGH_GAS_LIMIT = BigNumber.from('400000')
export const STAKING_LOW_GAS_LIMIT = BigNumber.from('200000')
export const TRADING_REWARDS_CUTOFF_EPOCH = 13
export const OP_REWARDS_CUTOFF_EPOCH = 22

export const SUPPLY_RATE = wei(1).sub(wei(DECAY_RATE))
