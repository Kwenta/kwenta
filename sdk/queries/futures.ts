import { formatBytes32String } from 'ethers/lib/utils.js';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import {
	FuturesAccountType,
	getFuturesPositions,
	getFuturesTrades,
} from 'queries/futures/subgraph';
import { CROSS_MARGIN_FRAGMENT, ISOLATED_MARGIN_FRAGMENT } from 'sdk/constants/futures';
import { mapCrossMarginTransfers, mapMarginTransfers } from 'sdk/utils/futures';

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

const queryAccountFromLogs = async (sdk: KwentaSDK, address: string | null): Promise<string[]> => {
	const { CrossMarginAccountFactory } = sdk.context.contracts;
	if (!CrossMarginAccountFactory) return [];
	const accountFilter = CrossMarginAccountFactory.filters.NewAccount(address);
	if (accountFilter) {
		const logs = await CrossMarginAccountFactory.queryFilter(accountFilter);
		if (logs.length) {
			return logs.map((l) => l.args?.[1]);
		}
	}
	return [];
};

export const queryCrossMarginAccounts = async (
	sdk: KwentaSDK,
	walletAddress: string
): Promise<string[]> => {
	const accounts = await queryAccountFromLogs(sdk, walletAddress);
	return accounts;
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

export const queryIsolatedMarginTransfers = async (sdk: KwentaSDK, account: string) => {
	const response = await request(sdk.futures.futuresGqlEndpoint, ISOLATED_MARGIN_FRAGMENT, {
		walletAddress: account,
	});
	return response ? mapMarginTransfers(response.isolatedMarginAccountTransfers) : [];
};

export const queryCrossMarginTransfers = async (sdk: KwentaSDK, account: string) => {
	const response = await request(sdk.futures.futuresGqlEndpoint, CROSS_MARGIN_FRAGMENT, {
		walletAddress: account,
	});
	return response ? mapCrossMarginTransfers(response.crossMarginAccountTransfers) : [];
};
