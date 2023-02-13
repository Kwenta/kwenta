import { formatBytes32String } from 'ethers/lib/utils.js';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import {
	FuturesAccountType,
	getFuturesPositions,
	getFuturesTrades,
} from 'queries/futures/subgraph';
import { ZERO_ADDRESS } from 'sdk/constants/global';

export const queryAccountsFromSubgraph = async (
	sdk: KwentaSDK,
	walletAddress: string | null
): Promise<string[]> => {
	if (!walletAddress) return [];
	const response = await request(
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
	);
	return response?.crossMarginAccounts.map((cm: { id: string }) => cm.id) || [];
};

export const queryCrossMarginAccounts = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<string[]> => {
	// TODO: Contract should be updating to support one to many
	const account = await sdk.context.contracts.CrossMarginAccountFactory?.ownerToAccount(
		walletAddress
	);
	if (!account || account === ZERO_ADDRESS) return [];
	return [account];
};

export const queryTrades = async (
	sdk: KwentaSDK,
	params: {
		walletAddress: string;
		accountType: FuturesAccountType;
		marketAsset?: string;
		pageLength: number;
	}
) => {
	const filter: Record<string, string> = {
		account: params.walletAddress,
		accountType: params.accountType,
	};
	if (params.marketAsset) {
		filter['asset'] = formatBytes32String(params.marketAsset);
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
			orderType: true,
		}
	);
};

export const queryPositionHistory = (sdk: KwentaSDK, account: string) => {
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
	);
};
