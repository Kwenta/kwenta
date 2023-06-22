import { SynthBalance, TokenBalances } from '@kwenta/sdk/types'
import { notNill } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { orderBy } from 'lodash'

import { BalancesActionReturn } from 'state/balances/types'

export const sortWei = (a: Wei, b: Wei, order: 'descending' | 'ascending') => {
	const diff = order === 'ascending' ? a.sub(b) : b.sub(a)

	if (diff.gt(0)) {
		return 1
	} else if (diff.lt(0)) {
		return -1
	} else {
		return 0
	}
}

export const serializeBalances = (
	synthBalancesMap: Record<string, SynthBalance>,
	totalUSDBalance: Wei,
	tokenBalances: TokenBalances,
	susdWalletBalance: Wei
): BalancesActionReturn<string> => {
	const balancesMapSerialized = Object.entries(synthBalancesMap).reduce<
		Record<string, SynthBalance<string>>
	>((acc, [key, value]) => {
		if (value) {
			acc[key] = {
				...value,
				balance: value.balance.toString(),
				usdBalance: value.usdBalance.toString(),
			}
		}

		return acc
	}, {})

	const balancesList = orderBy(
		Object.values(balancesMapSerialized).filter(notNill),
		(balance) => Number(balance.usdBalance),
		'desc'
	)
	return {
		synthBalances: balancesList,
		synthBalancesMap: balancesMapSerialized,
		totalUSDBalance: totalUSDBalance.toString(),
		susdWalletBalance: susdWalletBalance.toString(),
		tokenBalances: Object.entries(tokenBalances).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = { ...value, balance: value.balance.toString() }
			}

			return acc
		}, {} as any),
	}
}

export const unserializeBalances = (
	synthBalancesMap: Record<string, SynthBalance<string>>,
	totalUSDBalance: string,
	tokenBalances: TokenBalances<string>,
	susdWalletBalance: string
): BalancesActionReturn => {
	const balancesMapSerialized = Object.entries(synthBalancesMap).reduce<
		Record<string, SynthBalance>
	>((acc, [key, value]) => {
		if (value) {
			acc[key] = {
				...value,
				balance: wei(value.balance),
				usdBalance: wei(value.usdBalance),
			}
		}

		return acc
	}, {})

	const balancesList = orderBy(
		Object.values(balancesMapSerialized).filter(notNill),
		(balance) => balance.usdBalance.toNumber(),
		'desc'
	)
	return {
		synthBalances: balancesList,
		synthBalancesMap: balancesMapSerialized,
		totalUSDBalance: wei(totalUSDBalance),
		susdWalletBalance: wei(susdWalletBalance),
		tokenBalances: Object.entries(tokenBalances).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = { ...value, balance: wei(value.balance) }
			}

			return acc
		}, {} as any),
	}
}
