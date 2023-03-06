import { BigNumber } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils.js';
import KwentaSDK from 'sdk';

import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { MarketClosureReason, getReasonFromCode } from 'sdk/utils/synths';

export default class GeneralService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getSynthetixStatus() {
		const { SystemStatus, DappMaintenance } = this.sdk.context.multicallContracts;

		if (!SystemStatus || !DappMaintenance) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const [isSystemUpgrading, isExchangePaused] = (await this.sdk.context.multicallProvider.all([
			SystemStatus.isSystemUpgrading(),
			DappMaintenance.isPausedSX(),
		])) as [boolean, boolean];

		return isSystemUpgrading || isExchangePaused;
	}

	public async getSynthsSuspensionStatus() {
		const { SystemStatus } = this.sdk.context.multicallContracts;

		const synthsMap = this.sdk.exchange.getSynthsMap();

		if (!SystemStatus) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const calls = [];

		for (let synth in synthsMap) {
			calls.push(SystemStatus.synthExchangeSuspension(formatBytes32String(synth)));
		}

		const responses = (await this.sdk.context.multicallProvider.all(calls)) as [
			boolean,
			BigNumber
		][];

		let ret: Record<
			string,
			{ isSuspended: boolean; reasonCode: number; reason: MarketClosureReason | null }
		> = {};
		let i = 0;

		for (let synth in synthsMap) {
			const [isSuspended, reason] = responses[i];
			const reasonCode = Number(reason);

			ret[synth] = {
				isSuspended: responses[i][0],
				reasonCode,
				reason: isSuspended ? getReasonFromCode(reasonCode) : null,
			};

			i++;
		}

		return ret;
	}
}
