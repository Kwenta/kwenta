import request, { gql } from 'graphql-request'
import KwentaSDK from '..'
import { OperatorApprovals } from '../types'

export const queryOperatorsByOwner = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<OperatorApprovals[]> => {
	if (!walletAddress) return []
	const response: { operatorApproveds: OperatorApprovals[] } = await request(
		sdk.kwentaToken.stakingGqlEndpoint,
		gql`
			query operatorApproveds($walletAddress: String!) {
				operatorApproveds(
					orderBy: blockTimestamp
					orderDirection: desc
					where: { owner: $walletAddress }
				) {
					operator
					blockTimestamp
					approved
				}
			}
		`,
		{ walletAddress }
	)
	return response?.operatorApproveds || []
}
