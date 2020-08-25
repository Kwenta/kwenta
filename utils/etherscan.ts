import { NetworkIds, SUPPORTED_NETWORKS } from '@synthetixio/js';

const getEtherscanBaseURL = (networkId: NetworkIds) => {
	const network = SUPPORTED_NETWORKS[networkId];

	if (networkId === NetworkIds.Mainnet || network == null) {
		return 'https://etherscan.io';
	}
	return `https://${network}.etherscan.io`;
};

class EtherscanLinks {
	baseURL: string;
	networkId: NetworkIds;

	constructor(networkId: NetworkIds) {
		this.networkId = networkId;
		this.baseURL = getEtherscanBaseURL(networkId);
	}

	public setNetworkId(networkId: NetworkIds) {
		this.networkId = networkId;
		this.baseURL = getEtherscanBaseURL(networkId);
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
