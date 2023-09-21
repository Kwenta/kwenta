import KwentaSDK from '..'
import { REFERRALS_ENDPOINTS } from '../constants/referrals'
import { queryVolumeByTrader } from '../queries/futures'
import { queryCodesByReferrer, queryTradersByCode } from '../queries/referrals'
import { limitConcurrency } from '../queries/utils'
import { FuturesTradeByReferral } from '../types/futures'
import { ReferralCumulativeStats } from '../types/referrals'

const calculateTraderVolume = (futuresTrades: FuturesTradeByReferral[]) => {
	return futuresTrades.reduce((acc, trade) => {
		return acc + (Math.abs(+trade.size) / 1e18) * (+trade.price / 1e18)
	}, 0)
}

export const getReferralsGqlEndpoint = (networkId: number) => {
	return REFERRALS_ENDPOINTS[networkId] || REFERRALS_ENDPOINTS[10]
}

export const getReferralStatisticsByAccount = async (
	sdk: KwentaSDK,
	account: string
): Promise<ReferralCumulativeStats[]> => {
	const codes = await queryCodesByReferrer(sdk, account)

	return await Promise.all(
		codes.map(async (code) => {
			const traders = await queryTradersByCode(sdk, code)

			return {
				code,
				referredCount: traders.length.toString(),
				referralVolume: '0',
				earnedRewards: '0',
			}
		})
	)
}
