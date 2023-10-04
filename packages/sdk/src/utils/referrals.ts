import request, { gql } from 'graphql-request'
import KwentaSDK from '..'
import { REFERRALS_ENDPOINTS } from '../constants/referrals'
import { queryCodesByReferrer, queryTradersByCode } from '../queries/referrals'
import { FuturesTradeByReferral } from '../types/futures'
import { ReferralCumulativeStats } from '../types/referrals'
import { ZERO_WEI } from '../constants'

const calculateTraderVolume = (futuresTrades: FuturesTradeByReferral[]) => {
	return futuresTrades.reduce((acc, trade) => {
		return acc + (Math.abs(+trade.size) / 1e18) * (+trade.price / 1e18)
	}, 0)
}

export const getReferralsGqlEndpoint = (networkId: number) => {
	return REFERRALS_ENDPOINTS[networkId] || REFERRALS_ENDPOINTS[10]
}

const getCumulativeStatsByCode = async (
	sdk: KwentaSDK,
	account: string,
	epochStart?: number,
	epochEnd?: number,
	epochPeriod?: number
): Promise<ReferralCumulativeStats[]> => {
	const codes = await queryCodesByReferrer(sdk, account)
	const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000)
	return Promise.all(
		codes.map(async (code) => {
			const traders = await queryTradersByCode(sdk, code, epochStart, epochEnd)
			const totalRewards = epochPeriod
				? await sdk.kwentaToken.getKwentaRewardsByTraders(
						epochPeriod,
						traders.map(({ id }) => id)
				  )
				: ZERO_WEI

			const traderVolumeQueries = await Promise.all(
				traders.map(({ id, lastMintedAt }) => {
					const start = epochStart ? Math.max(Number(lastMintedAt), epochStart) : lastMintedAt
					const end = epochEnd ? Math.min(currentTimeInSeconds, epochEnd) : currentTimeInSeconds
					return gql`
					user_${id}: futuresTrades(
						first: 1000
						where: {
							timestamp_gt: ${start}
							timestamp_lte: ${end}
							trackingCode: "0x4b57454e54410000000000000000000000000000000000000000000000000000"
							account: "${id}"
						}
						orderBy: timestamp
						orderDirection: asc
					) {
						timestamp
						account
						size
						price
					}
					`
				})
			)

			if (traderVolumeQueries.length > 0) {
				const response: Record<string, FuturesTradeByReferral[]> = await request(
					sdk.futures.futuresGqlEndpoint,
					gql`
						query totalFuturesTrades {
							${traderVolumeQueries.join('')}
						}
					`
				)

				const totalTrades = response ? Object.values(response).flat() : []
				const totalVolume = calculateTraderVolume(totalTrades)

				return {
					code,
					referredCount: traders.length.toString(),
					referralVolume: totalVolume.toString(),
					earnedRewards: totalRewards.toString(),
				}
			} else {
				return {
					code,
					referredCount: '0',
					referralVolume: '0',
					earnedRewards: totalRewards.toString(),
				}
			}
		})
	)
}

export const getReferralStatisticsByAccount = (sdk: KwentaSDK, account: string) => {
	return getCumulativeStatsByCode(sdk, account)
}

export const getReferralStatisticsByAccountAndEpochTime = (
	sdk: KwentaSDK,
	account: string,
	epochStart: number,
	epochEnd: number
) => {
	return getCumulativeStatsByCode(sdk, account, epochStart, epochEnd)
}

export const getReferralStatisticsByAccountAndEpoch = (
	sdk: KwentaSDK,
	account: string,
	epochPeriod?: number
) => {
	return getCumulativeStatsByCode(sdk, account, undefined, undefined, epochPeriod)
}
