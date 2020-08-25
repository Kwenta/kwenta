import { NetworkIds } from '@synthetixio/js';
import onboard from 'bnc-onboard';
import notify from 'bnc-notify';

import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';

export const initOnboard = (networkId: NetworkIds, subscriptions: Subscriptions) => {
	const infuraRpc = getInfuraRpcURL(networkId);

	return onboard({
		dappId: process.env.BN_ONBOARD_API_KEY,
		hideBranding: true,
		networkId,
		subscriptions,
		walletSelect: {
			wallets: [
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
			],
		},
		walletCheck: [
			{ checkName: 'derivationPath' },
			{ checkName: 'accounts' },
			{ checkName: 'connect' },
			{ checkName: 'network' },
		],
	});
};

export const initNotify = (networkId: NetworkIds) =>
	notify({
		dappId: process.env.BN_NOTIFY_API_KEY!,
		networkId,
	});
