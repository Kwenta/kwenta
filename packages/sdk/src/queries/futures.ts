import { formatBytes32String } from '@ethersproject/strings'
import request, { gql } from 'graphql-request'

import KwentaSDK from '..'
import {
	SMART_MARGIN_FRAGMENT,
	ISOLATED_MARGIN_FRAGMENT,
	DEFAULT_NUMBER_OF_TRADES,
} from '../constants/futures'
import { FuturesMarketAsset, FuturesMarketKey } from '../types/futures'
import { mapMarginTransfers, mapSmartMarginTransfers } from '../utils/futures'
import { FuturesAccountType, getFuturesPositions, getFuturesTrades } from '../utils/subgraph'

export const queryAccountsFromSubgraph = async (
	sdk: KwentaSDK,
	walletAddress: string | null
): Promise<string[]> => {
	if (!walletAddress) return []
	const response: any = await request(
		sdk.futures.futuresGqlEndpoint,
		gql`
			query crossMarginAccounts($owner: String!) {
				crossMarginAccounts(where: { owner: $owner }) {
					id
					owner
				}
			}
		`,
		{ owner: walletAddress }
	)
	return response?.crossMarginAccounts.map((cm: { id: string }) => cm.id) || []
}

export const queryCrossMarginAccounts = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<string[]> => {
	// TODO: Contract should be updating to support one to many
	const accounts = await sdk.context.contracts.SmartMarginAccountFactory?.getAccountsOwnedBy(
		walletAddress
	)
	return accounts ?? []
}

export const queryTrades = async (
	sdk: KwentaSDK,
	params: {
		walletAddress: string
		accountType: FuturesAccountType
		marketAsset?: string
		pageLength: number
	}
) => {
	const filter: Record<string, string> = {
		account: params.walletAddress,
		accountType: params.accountType === 'isolated_margin' ? 'isolated_margin' : 'smart_margin',
	}
	if (params.marketAsset) {
		filter['asset'] = formatBytes32String(params.marketAsset)
	}
	return getFuturesTrades(
		sdk.futures.futuresGqlEndpoint,
		{
			first: params.pageLength,
			where: filter,
			orderDirection: 'desc',
			orderBy: 'timestamp',
		},
		{
			id: true,
			timestamp: true,
			account: true,
			abstractAccount: true,
			accountType: true,
			margin: true,
			size: true,
			marketKey: true,
			asset: true,
			price: true,
			positionId: true,
			positionSize: true,
			positionClosed: true,
			pnl: true,
			feesPaid: true,
			keeperFeesPaid: true,
			orderType: true,
			trackingCode: true,
			fundingAccrued: true,
		}
	)
}

export const queryPositionHistory = (sdk: KwentaSDK, account: string) => {
	return getFuturesPositions(
		sdk.futures.futuresGqlEndpoint,
		{
			where: {
				abstractAccount: account,
			},
			first: 99999,
			orderBy: 'openTimestamp',
			orderDirection: 'desc',
		},
		{
			id: true,
			lastTxHash: true,
			openTimestamp: true,
			closeTimestamp: true,
			timestamp: true,
			market: true,
			marketKey: true,
			asset: true,
			account: true,
			abstractAccount: true,
			accountType: true,
			isOpen: true,
			isLiquidated: true,
			trades: true,
			totalVolume: true,
			size: true,
			initialMargin: true,
			margin: true,
			pnl: true,
			feesPaid: true,
			netFunding: true,
			pnlWithFeesPaid: true,
			netTransfers: true,
			totalDeposits: true,
			fundingIndex: true,
			entryPrice: true,
			avgEntryPrice: true,
			lastPrice: true,
			exitPrice: true,
		}
	)
}

export const queryCompletePositionHistory = (sdk: KwentaSDK, account: string) => {
	return getFuturesPositions(
		sdk.futures.futuresGqlEndpoint,
		{
			where: {
				account: account,
			},
			first: 99999,
			orderBy: 'openTimestamp',
			orderDirection: 'desc',
		},
		{
			id: true,
			lastTxHash: true,
			openTimestamp: true,
			closeTimestamp: true,
			timestamp: true,
			market: true,
			marketKey: true,
			asset: true,
			account: true,
			abstractAccount: true,
			accountType: true,
			isOpen: true,
			isLiquidated: true,
			trades: true,
			totalVolume: true,
			size: true,
			initialMargin: true,
			margin: true,
			pnl: true,
			feesPaid: true,
			netFunding: true,
			pnlWithFeesPaid: true,
			netTransfers: true,
			totalDeposits: true,
			fundingIndex: true,
			entryPrice: true,
			avgEntryPrice: true,
			lastPrice: true,
			exitPrice: true,
		}
	)
}

export const queryIsolatedMarginTransfers = async (sdk: KwentaSDK, account: string) => {
	const response: any = await request(sdk.futures.futuresGqlEndpoint, ISOLATED_MARGIN_FRAGMENT, {
		walletAddress: account,
	})
	return response ? mapMarginTransfers(response.futuresMarginTransfers) : []
}

export const querySmartMarginTransfers = async (sdk: KwentaSDK, account: string) => {
	const response: any = await request(sdk.futures.futuresGqlEndpoint, SMART_MARGIN_FRAGMENT, {
		walletAddress: account,
	})
	return response ? mapSmartMarginTransfers(response.smartMarginAccountTransfers) : []
}

export const queryFuturesTrades = (
	sdk: KwentaSDK,
	marketKey: FuturesMarketKey,
	minTs: number,
	maxTs: number
) => {
	return getFuturesTrades(
		sdk.futures.futuresGqlEndpoint,
		{
			first: DEFAULT_NUMBER_OF_TRADES,
			where: {
				marketKey: formatBytes32String(marketKey),
				timestamp_gt: minTs,
				timestamp_lt: maxTs,
			},
			orderDirection: 'desc',
			orderBy: 'timestamp',
		},
		{
			id: true,
			timestamp: true,
			account: true,
			abstractAccount: true,
			accountType: true,
			margin: true,
			size: true,
			marketKey: true,
			asset: true,
			price: true,
			positionId: true,
			positionSize: true,
			positionClosed: true,
			pnl: true,
			feesPaid: true,
			keeperFeesPaid: true,
			orderType: true,
			fundingAccrued: true,
			trackingCode: true,
		}
	)
}

export const queryFundingRateHistory = async (
	sdk: KwentaSDK,
	marketAsset: FuturesMarketAsset,
	minTimestamp: number,
	period: 'Hourly' | 'Daily' = 'Hourly'
) => {
	const response: any = await request(
		sdk.futures.futuresGqlEndpoint,
		gql`
			query fundingRateUpdate(
				$marketAsset: Bytes!
				$minTimestamp: BigInt!
				$period: FundingRatePeriodType!
			) {
				fundingRatePeriods(
					where: { asset: $marketAsset, timestamp_gt: $minTimestamp, period: $period }
					first: 2000
				) {
					timestamp
					fundingRate
				}
			}
		`,
		{ marketAsset: formatBytes32String(marketAsset), minTimestamp, period }
	)

	return response.fundingRatePeriods.map((x: any) => ({
		timestamp: Number(x.timestamp) * 1000,
		fundingRate: Number(x.fundingRate),
	}))
}
