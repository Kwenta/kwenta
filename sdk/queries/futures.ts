import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import { getFuturesEndpoint } from 'sdk/utils/futures';

export const queryAccountsFromSubgraph = async (
	networkId: NetworkId,
	walletAddress: string | null
): Promise<string[]> => {
	if (!walletAddress) return [];

	const futuresEndpoint = getFuturesEndpoint(networkId);
	const response = await request(
		futuresEndpoint,
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
