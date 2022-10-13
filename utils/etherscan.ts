import { NetworkIdByName } from '@synthetixio/contracts-interface';

import { Network } from 'store/wallet';

const getEtherscanBaseURL = (network: Network) => {
	if (network?.id === NetworkIdByName.mainnet) {
		return 'https://etherscan.io';
	} else if (network?.id === NetworkIdByName['kovan-ovm']) {
		return 'https://kovan-optimistic.etherscan.io';
	} else if (network?.id === NetworkIdByName['mainnet-ovm']) {
		return 'https://optimistic.etherscan.io';
	}
	return `https://${network.name}.etherscan.io`;
};

class EtherscanLinks {
	baseURL: string;
	network: Network;

	constructor(network: Network) {
		this.network = network;
		this.baseURL = getEtherscanBaseURL(network);
	}

	public setNetworkId(network: Network) {
		this.network = network;
		this.baseURL = getEtherscanBaseURL(network);
	}

	public txLink(txId: string) {
		return `${this.baseURL}/tx/${txId}`;
	}

	public addressLink(address: string) {
		return `${this.baseURL}/address/${address}`;
	}

	public tokenLink(address: string) {
		return `${this.baseURL}/token/${address}`;
	}
}

export default EtherscanLinks;
