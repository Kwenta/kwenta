import { NetworkId } from '@synthetixio/contracts-interface';

export default class FuturesService {
	private networkId: NetworkId;

	constructor(networkId: NetworkId) {
		this.networkId = networkId;
	}
}
