import request, { gql } from 'graphql-request'

import KwentaSDK from '..'
import { PerpsV3SubgraphMarket, SettlementSubgraphType } from '../types'

export const queryPerpsV3Markets = async (sdk: KwentaSDK): Promise<PerpsV3SubgraphMarket[]> => {
	const response: any = await request(
		sdk.perpsV3.subgraphUrl,
		gql`
			query {
				markets {
					id
					perpsMarketId
					marketOwner
					marketName
					marketSymbol
					feedId
					owner
					maxFundingVelocity
					skewScale
					liquidationRewardRatioD18
					maxLiquidationLimitAccumulationMultiplier
					lockedOiPercent
					makerFee
					takerFee
				}
			}
		`
	)

	return response.markets
}

export const queryPerpsV3Accounts = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<
	{
		id: string
		accountId: string
		owner: string
	}[]
> => {
	const response: any = await request(
		sdk.perpsV3.subgraphUrl,
		gql`
			query GetAccounts($owner: String) {
				accounts(where: { owner_contains: $owner }) {
					id
					accountId
					owner
				}
			}
		`,
		{
			owner: walletAddress,
		}
	)

	return response.accounts
}

export const querySettlementStrategies = async (
	sdk: KwentaSDK
): Promise<SettlementSubgraphType[]> => {
	const response: any = await request(
		sdk.perpsV3.subgraphUrl,
		gql`
			query GetSettlementStrategies {
				settlementStrategies(orderBy: "marketId", orderDirection: "desc") {
					id
					marketId
					strategyId
					strategyType
					settlementDelay
					settlementWindowDuration
					url
					settlementReward
					priceDeviationTolerance
				}
			}
		`
	)

	return response.settlementStrategies
}
