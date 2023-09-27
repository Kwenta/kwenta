import { request, gql } from 'graphql-request'
import KwentaSDK from '..'
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings'
import { BoostHolder, BoostReferrer } from '../types/referrals'

export const queryReferrerByCode = async (sdk: KwentaSDK, code: string): Promise<string | null> => {
	const response: any = await request(
		sdk.referrals.referralsGqlEndpoint,
		gql`
			query boostReferrers($code: String!) {
				boostReferrers(where: { id: $code }) {
					account
				}
			}
		`,
		{ code: formatBytes32String(code) }
	)
	return response?.boostReferrers[0]?.account || null
}

export const queryBoostNftTierByHolder = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<number> => {
	if (!walletAddress) return -1
	const response: any = await request(
		sdk.referrals.referralsGqlEndpoint,
		gql`
			query boostHolders($walletAddress: String!) {
				boostHolders(where: { id: $walletAddress }) {
					tier
				}
			}
		`,
		{ walletAddress }
	)

	return response?.boostHolders[0]?.tier || -1
}

export const queryCodesByReferrer = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<string[]> => {
	if (!walletAddress) return []
	const response: { boostReferrers: BoostReferrer[] } = await request(
		sdk.referrals.referralsGqlEndpoint,
		gql`
			query boostReferrers($walletAddress: String!) {
				boostReferrers(where: { account: $walletAddress }) {
					id
				}
			}
		`,
		{ walletAddress }
	)
	return response?.boostReferrers.map(({ id }) => parseBytes32String(id)) || []
}

export const queryTradersByCode = async (
	sdk: KwentaSDK,
	code: string,
	epochStart?: number,
	epochEnd?: number
): Promise<BoostHolder[]> => {
	let queryResponseCount = 0
	const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000)
	const end = epochEnd ? Math.min(currentTimeInSeconds, epochEnd) : currentTimeInSeconds
	const boostHolders: BoostHolder[] = []
	const minTimestamp = epochStart || 0
	let maxTimestamp = end

	do {
		const response: { boostHolders: BoostHolder[] } = await request(
			sdk.referrals.referralsGqlEndpoint,
			gql`
				query boostHolders($code: String!, $minTimestamp: BigInt!, $maxTimestamp: BigInt!) {
					boostHolders(
						where: { lastMintedAt_lte: $maxTimestamp, lastMintedAt_gt: $minTimestamp, code: $code }
						orderBy: lastMintedAt
						orderDirection: desc
						first: 1000
					) {
						id
						lastMintedAt
					}
				}
			`,
			{ code: formatBytes32String(code), maxTimestamp, minTimestamp }
		)

		queryResponseCount = response.boostHolders.length

		if (queryResponseCount > 0) {
			maxTimestamp = Number(response.boostHolders[queryResponseCount - 1].lastMintedAt)
			boostHolders.push(...response.boostHolders)
		}
	} while (queryResponseCount === 1000)

	return boostHolders
}
