import KwentaSDK from 'sdk';

import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';

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
}
