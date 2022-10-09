import { ethers } from 'ethers';

export default class Context {
	public provider: ethers.providers.Provider;

	constructor(provider: ethers.providers.Provider) {
		this.provider = provider;
	}
}
