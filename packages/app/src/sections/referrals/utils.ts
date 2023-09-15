import { ReferralRewardsInfo } from './types'

export const calculateTotal = <T extends ReferralRewardsInfo, K extends keyof T>(
	arr: T[],
	key: K
): number => arr.reduce((acc, obj) => acc + Number(obj[key]), 0)
