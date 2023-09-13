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

export const queryTradersByCode = async (sdk: KwentaSDK, code: string): Promise<BoostHolder[]> => {
	const response: { boostHolders: BoostHolder[] } = await request(
		sdk.referrals.referralsGqlEndpoint,
		gql`
			query boostHolders($code: String!) {
				boostHolders(where: { code: $code }) {
					id
					lastMintedAt
				}
			}
		`,
		{ code: formatBytes32String(code) }
	)
	return response?.boostHolders || []
}
