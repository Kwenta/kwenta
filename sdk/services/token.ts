import KwentaSDK from 'sdk';

export default class TokenService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}
}
