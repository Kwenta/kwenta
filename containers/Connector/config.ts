import { NetworkIdByName } from '@synthetixio/contracts-interface';
import onboard from 'bnc-onboard';
import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';

import { Network } from 'store/wallet';
import { getInfuraRpcURL } from 'utils/infura';

export const initOnboard = (network: Network, subscriptions: Subscriptions) => {
	const infuraRpc = getInfuraRpcURL(network.id);

	return onboard({
		dappId: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
		hideBranding: true,
		networkId: Number(network.id),
		subscriptions,
		darkMode: true,
		walletSelect: {
			wallets: [
				{
					name: 'Browser Wallet',
					iconSrc: '/images/wallet-icons/browserWallet.svg',
					type: 'injected',
					link: 'https://metamask.io',
					wallet: async (helpers) => {
						const { createModernProviderInterface } = helpers;
						const provider = window.ethereum;
						return {
							provider,
							interface: provider ? createModernProviderInterface(provider) : null,
						};
					},
					preferred: true,
					desktop: true,
					mobile: true,
				},
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
					preferred: true,
				},
				{
					walletName: 'walletConnect',
					rpc: Object.values(NetworkIdByName).reduce((acc, id) => {
						acc[id] = getInfuraRpcURL(id);
						return acc;
					}, {} as Record<string, string>),
					preferred: true,
				},
				{ walletName: 'imToken', rpcUrl: infuraRpc, preferred: true },
				{
					walletName: 'portis',
					apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID,
				},
				{ walletName: 'gnosis', rpcUrl: infuraRpc },
				{ walletName: 'trust', rpcUrl: infuraRpc },
				{ walletName: 'walletLink', rpcUrl: infuraRpc, preferred: true },
				{ walletName: 'torus' },
				{ walletName: 'status' },
				{ walletName: 'authereum' },
				{ walletName: 'tally' },
			],
		},
		walletCheck: [
			{ checkName: 'derivationPath' },
			{ checkName: 'accounts' },
			{ checkName: 'connect' },
		],
	});
};
