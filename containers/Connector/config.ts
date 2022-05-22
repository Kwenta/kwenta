import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import ledgerModule from '@web3-onboard/ledger';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import trezorModule from '@web3-onboard/trezor';
import walletConnectModule from '@web3-onboard/walletconnect';
import gnosisModule from '@web3-onboard/gnosis';
import portisModule from '@web3-onboard/portis';
import torusModule from '@web3-onboard/torus';

import { getInfuraRpcURL } from 'utils/infura';
import { SUPPORTED_NETWORKS } from 'constants/network';
import { NetworkId } from '@synthetixio/contracts-interface';

const EMAIL = 'info@synthetix.io';
const APP_URL = 'https://www.synthetix.io';

const injected = injectedModule();
const ledger = ledgerModule();
const coinbase = coinbaseWalletModule({ darkMode: true });
const trezor = trezorModule({ email: EMAIL, appUrl: APP_URL });
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();
const portis = portisModule({ apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID || '' });
const torus = torusModule();

export const WEB3ONBOARD_SUPPORTED_NETWORKS: Record<string, string> = {
	1: '1',
	5: '5',
	10: 'a',
	42: '2a',
	// TODO: Update the following chain id value once blocknative adds the Optimism Kovan chain to the supported chains.
	// Ticket: https://github.com/blocknative/web3-onboard/issues/1006
	69: '69',
	31337: '',
};

export const formatChain = (id: NetworkId) => {
	return '0x' + WEB3ONBOARD_SUPPORTED_NETWORKS[id];
};

export const initOnboard = init({
	wallets: [injected, ledger, coinbase, trezor, walletConnect, gnosis, portis, torus],
	chains: [
		{
			id: formatChain(SUPPORTED_NETWORKS[0] as NetworkId),
			token: 'ETH',
			label: 'Ethereum Mainnet',
			rpcUrl: getInfuraRpcURL(1),
		},
		{
			id: formatChain(SUPPORTED_NETWORKS[1] as NetworkId),
			token: 'ETH',
			label: 'Optimism',
			rpcUrl: getInfuraRpcURL(10),
		},
		{
			id: formatChain(SUPPORTED_NETWORKS[2] as NetworkId),
			token: 'KOV',
			label: 'Kovan',
			rpcUrl: getInfuraRpcURL(42),
		},
		{
			id: formatChain(SUPPORTED_NETWORKS[3] as NetworkId),
			token: 'KOR',
			label: 'Optimism Kovan',
			rpcUrl: getInfuraRpcURL(69),
		},
	],
	appMetadata: {
		name: 'Kwenta',
		icon: '/images/favicon.svg',
		logo: '/images/kwenta-web3onboard.png',
		description:
			'Gain exposure to cryptocurrencies, forex, equities, indices, and commodities on Ethereum with zero slippage.',
		gettingStartedGuide: 'https://kwenta.io/',
		explore: 'https://kwenta.io/',
		recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
	},
	// TODO: Do not display the web3-onboard account center UI.
	accountCenter: {
		desktop: {
			//enabled: false,
			position: 'bottomLeft',
		},
	},
});
