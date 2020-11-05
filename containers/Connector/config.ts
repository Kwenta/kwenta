import onboard from 'bnc-onboard';
import notify, { InitOptions } from 'bnc-notify';

import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL } from 'utils/infura';

import { Network } from 'store/wallet';

import notifyMessages from 'translations/bnc-notify/notifyMessages';

export const initOnboard = (network: Network, subscriptions: Subscriptions) => {
	const infuraRpc = getInfuraRpcURL(network);

	return onboard({
		dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
		hideBranding: true,
		networkId: network.id,
		subscriptions,
		darkMode: true,
		walletSelect: {
			wallets: [
				{ walletName: 'metamask', preferred: true },
				{
					walletName: 'ledger',
					rpcUrl: infuraRpc,
					preferred: true,
				},
				{
					walletName: 'lattice',
					appName: 'Kwenta',
					rpcUrl: infuraRpc,
				},
				{
					walletName: 'trezor',
					appUrl: 'https://www.synthetix.io',
					email: 'info@synthetix.io',
					rpcUrl: infuraRpc,
				},
				{
					walletName: 'walletConnect',
					rpc: { [network.id]: infuraRpc },
					preferred: true,
				},
				{ walletName: 'coinbase', preferred: true },
				{
					walletName: 'portis',
					apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID,
					preferred: true,
				},
				{ walletName: 'trust', rpcUrl: infuraRpc },
				{ walletName: 'dapper' },
				{ walletName: 'walletLink', rpcUrl: infuraRpc },
				{ walletName: 'torus' },
				{ walletName: 'status' },
				// { walletName: 'unilogin' },
				{ walletName: 'authereum' },
				{ walletName: 'imToken' },
			],
		},
		walletCheck: [
			{ checkName: 'derivationPath' },
			{ checkName: 'accounts' },
			{ checkName: 'connect' },
		],
	});
};

export const initNotify = (network: Network, options: InitOptions) =>
	notify({
		darkMode: true,
		dappId: process.env.NEXT_PUBLIC_BN_NOTIFY_API_KEY!,
		networkId: network.id,
		desktopPosition: 'topRight',
		notifyMessages,
	});
