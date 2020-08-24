import { NetworkId, isMainNet, SUPPORTED_NETWORKS } from 'constants/network';

const getEtherscanBaseURL = (networkId: NetworkId) => {
	const network = SUPPORTED_NETWORKS[networkId];

	if (isMainNet(networkId) || network == null) {
		return 'https://etherscan.io';
	}
	return `https://${network.toLowerCase()}.etherscan.io`;
};

class EtherscanLinks {
	baseURL: string;
	networkId: NetworkId;

	constructor(networkId: NetworkId) {
		this.networkId = networkId;
		this.baseURL = getEtherscanBaseURL(networkId);
	}

	public setNetworkId(networkId: NetworkId) {
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
