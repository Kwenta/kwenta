import KwentaSDK from 'sdk';

import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';

import { OperationalStatus } from '../types/system';
import { client } from '../utils/files';

const StatusMap = {
	'0': OperationalStatus.FullyOperational,
	'1': OperationalStatus.Degraded,
	'2': OperationalStatus.Offline,
} as const;

export type KwentaStatus = {
	status: OperationalStatus;
	message: string;
	lastUpdatedAt: string;
};

export default class SystemService {
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

	public async getKwentaStatus(): Promise<KwentaStatus> {
		const response = await client.get('kwenta-status.json');

		return {
			...response.data,
			status: StatusMap[response.data.status as keyof typeof StatusMap],
		};
	}
}
