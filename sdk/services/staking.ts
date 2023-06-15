import KwentaSDK from 'sdk';

import { REQUIRES_L2 } from 'sdk/common/errors';
import {
	AGGREGATE_ASSET_KEY,
	FUTURES_ENDPOINT_OP_MAINNET,
	KWENTA_TRACKING_CODE,
} from 'sdk/constants/futures';
import { SECONDS_PER_DAY } from 'sdk/constants/period';
import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'sdk/constants/staking';
import { getFuturesAggregateStats, getFuturesTrades } from 'sdk/utils/subgraph';

export default class StakingService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getFuturesFee(start: number, end: number) {
		if (!this.sdk.context.isL2) {
			throw new Error(REQUIRES_L2);
		}

		const response = await getFuturesAggregateStats(
			FUTURES_ENDPOINT_OP_MAINNET,
			{
				first: DEFAULT_NUMBER_OF_FUTURES_FEE,
				where: {
					asset: AGGREGATE_ASSET_KEY,
					period: SECONDS_PER_DAY,
					timestamp_gte: start,
					timestamp_lt: end,
				},
				orderDirection: 'desc',
				orderBy: 'timestamp',
			},
			{ timestamp: true, feesKwenta: true }
		);

		return response;
	}

	public async getFuturesFeeForAccount(account: string, start: number, end: number) {
		if (!account) return null;

		const response = await getFuturesTrades(
			FUTURES_ENDPOINT_OP_MAINNET,
			{
				first: DEFAULT_NUMBER_OF_FUTURES_FEE,
				where: {
					account: account,
					timestamp_gt: start,
					timestamp_lt: end,
					trackingCode: KWENTA_TRACKING_CODE,
				},
				orderDirection: 'desc',
				orderBy: 'timestamp',
			},
			{
				timestamp: true,
				account: true,
				abstractAccount: true,
				accountType: true,
				feesPaid: true,
				keeperFeesPaid: true,
			}
		);
		return response;
	}
}
