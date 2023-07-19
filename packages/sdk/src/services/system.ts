import KwentaSDK from '..'
import { UNSUPPORTED_NETWORK } from '../common/errors'
import { KwentaStatus } from '../types/system'
import { getClient } from '../utils/files'
import { StatusMap } from '../utils/system'

export default class SystemService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	public async getSynthetixStatus() {
		const { SystemStatus, DappMaintenance } = this.sdk.context.multicallContracts

		if (!SystemStatus || !DappMaintenance) {
			throw new Error(UNSUPPORTED_NETWORK)
		}

		const [isSystemUpgrading, isExchangePaused] = (await this.sdk.context.multicallProvider.all([
			SystemStatus.isSystemUpgrading(),
			DappMaintenance.isPausedSX(),
		])) as [boolean, boolean]

		return isSystemUpgrading || isExchangePaused
	}

	public async getKwentaStatus(): Promise<KwentaStatus> {
		const client = getClient()
		const response = await client.get('kwenta-status.json', {
			headers: { 'Cache-Control': 'no-cache' },
		})

		return {
			...response.data,
			status: StatusMap[response.data.status as keyof typeof StatusMap],
		}
	}
}
