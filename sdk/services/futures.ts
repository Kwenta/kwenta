import KwentaSDK from 'sdk';

export default class FuturesService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}
}
