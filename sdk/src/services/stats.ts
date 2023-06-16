import KwentaSDK from '..';

export default class StatsService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getStatsVolumes() {}

	public async getFuturesTradersStats() {}

	public async getFuturesCumulativeStats() {}
}
