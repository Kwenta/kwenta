import KwentaSDK from 'sdk';

export default class StatsService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getStatsVolumes() {}

	public async getFuturesTradersStats() {}

	public async getFuturesCumulativeStats() {}
}
