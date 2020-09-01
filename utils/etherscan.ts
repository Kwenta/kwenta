import { NetworkId } from '@synthetixio/js';

const getEtherscanBaseURL = (networkId: NetworkId) => {
	const network = 'mainnet';

	if (networkId === NetworkId.Mainnet || network == null) {
		return 'https://etherscan.io';
	}
	return `https://${network}.etherscan.io`;
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
