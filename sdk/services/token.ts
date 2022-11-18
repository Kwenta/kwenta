import { wei } from '@synthetixio/wei';
import KwentaSDK from 'sdk';

import * as sdkErrors from '../common/errors';

export default class TokenService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	// TODO: Figure out better name.
	public async changePoolTokens(amount: string, action: 'stake' | 'unstake') {
		if (!this.sdk.context.contracts.StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.StakingRewards,
			action,
			[wei(amount).toBN()]
		);

		return hash;
	}

	public async getEarnDetails() {
		const StakingRewards = this.sdk.context.contracts.StakingRewards;

		if (!StakingRewards) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const [balance, earned, periodFinish] = await Promise.all([
			StakingRewards.balanceOf(this.sdk.context.walletAddress),
			StakingRewards.earned(this.sdk.context.walletAddress),
			StakingRewards.periodFinish(),
		]);

		return { balance: wei(balance), earned: wei(earned), endDate: periodFinish.toNumber() };
	}
}
