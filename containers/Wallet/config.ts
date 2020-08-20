import { NetworkId, INFURA_JSON_RPC_URLS } from 'constants/network';

export const getWallets = (networkId: NetworkId) => {
	const infuraRpc = INFURA_JSON_RPC_URLS[networkId];

	return [
		{ walletName: 'metamask', preferred: true },
		{
			walletName: 'ledger',
			rpcUrl: infuraRpc,
			preferred: true,
		},
		{
			walletName: 'walletConnect',
			rpc: { [networkId]: infuraRpc },
			preferred: true,
		},
		{ walletName: 'coinbase', preferred: true },
		{
			walletName: 'portis',
			apiKey: process.env.PORTIS_APP_ID,
			preferred: true,
		},
		{ walletName: 'trust', rpcUrl: infuraRpc },
		{ walletName: 'dapper' },
		{ walletName: 'walletLink', rpcUrl: infuraRpc },
		{ walletName: 'opera' },
		{ walletName: 'operaTouch' },
		{ walletName: 'torus' },
		{ walletName: 'status' },
		{ walletName: 'unilogin' },
	];
};
