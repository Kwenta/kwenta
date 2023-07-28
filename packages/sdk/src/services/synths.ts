import { BigNumber } from '@ethersproject/bignumber'
import { parseBytes32String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'
import { orderBy } from 'lodash'

import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { ZERO_WEI } from '../constants/number'
import { SynthBalance, SynthV3BalancesAndAllowances } from '../types/synths'
import { notNill } from '../utils/general'

type SynthBalancesTuple = [string[], BigNumber[], BigNumber[]]

export default class SynthsService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	public async getSynthBalances(walletAddress: string) {
		if (!this.sdk.context.contracts.SynthUtil) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const balancesMap: Record<string, SynthBalance> = {}
		const [currencyKeys, synthsBalances, synthsUSDBalances]: SynthBalancesTuple =
			await this.sdk.context.contracts.SynthUtil.synthsBalances(walletAddress)

		let totalUSDBalance = wei(0)

		currencyKeys.forEach((currencyKeyBytes32, idx) => {
			const balance = wei(synthsBalances[idx])

			if (balance.gt(0)) {
				const synthName = parseBytes32String(currencyKeyBytes32)
				const usdBalance = wei(synthsUSDBalances[idx])

				balancesMap[synthName] = { currencyKey: synthName, balance, usdBalance }

				totalUSDBalance = totalUSDBalance.add(usdBalance)
			}
		})

		const balances = {
			balancesMap,
			balances: orderBy(
				Object.values(balancesMap).filter(notNill),
				(balance) => balance.usdBalance.toNumber(),
				'desc'
			),
			totalUSDBalance,
			susdWalletBalance: balancesMap?.['sUSD']?.balance ?? ZERO_WEI,
		}

		return balances
	}

	public async getSynthV3Balances(walletAddress: string) {
		const { SNXUSD } = this.sdk.context.multicallContracts

		if (!SNXUSD) throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		const [balance] = await this.sdk.context.multicallProvider.all([
			SNXUSD.balanceOf(walletAddress),
		])
		return { SNXUSD: wei(balance) }
	}

	public async getSynthV3BalancesAndAllowances(
		walletAddress: string,
		spenders: string[]
	): Promise<SynthV3BalancesAndAllowances> {
		const { SNXUSD } = this.sdk.context.multicallContracts

		if (!SNXUSD) throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		const [balance, ...allowances] = (await this.sdk.context.multicallProvider.all([
			SNXUSD.balanceOf(walletAddress),
			...spenders.map((s) => SNXUSD.allowance(walletAddress, s)),
		])) as [BigNumber, BigNumber[]]
		return {
			SNXUSD: {
				balance: wei(balance),
				allowances: allowances.reduce<Record<string, Wei>>((acc, a, i) => {
					acc[spenders[i]] = wei(a)
					return acc
				}, {}),
			},
		}
	}
}
