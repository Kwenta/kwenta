import request, { gql } from 'graphql-request'
import KwentaSDK from '..'
import { SynthExchange } from '../types'

export const queryWalletTrades = async (sdk: KwentaSDK, walletAddress: string) => {
	const response: any = await request(
		sdk.exchange.mainGqlEndpoint,
		gql`
			query WalletTrades($walletAddress: String!) {
				synthExchanges(
					where: { account: $walletAddress }
					first: 1000
					orderBy: "timestamp"
					orderDirection: "desc"
				) {
					id
					fromAmount
					fromAmountInUSD
					fromSynth {
						name
						symbol
						id
					}
					toSynth {
						name
						symbol
						id
					}
					toAmount
					toAmountInUSD
					feesInUSD
					toAddress
					timestamp
					gasPrice
				}
			}
		`,
		{ walletAddress: walletAddress.toLowerCase() }
	)

	return response?.synthExchanges as SynthExchange[]
}
