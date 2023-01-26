import KwentaSDK from 'sdk';

export default class LeaderboardService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getLeaderboard() {}
}
