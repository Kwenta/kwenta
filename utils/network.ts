import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId } from '@synthetixio/js';

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		if (window.web3?.eth?.net) {
			const networkId = await window.web3.eth.net.getId();
			return Number(networkId);
		} else if (window.web3?.version?.network) {
			return Number(window.web3.version.network);
		} else if (window.ethereum?.networkVersion) {
			return Number(window.ethereum?.networkVersion);
		}
		return DEFAULT_NETWORK_ID;
	} catch (e) {
		console.log(e);
		return DEFAULT_NETWORK_ID;
	}
}
