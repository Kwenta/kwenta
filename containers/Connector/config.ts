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
import { Network } from 'store/wallet';

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

// Convert web3-onboard chain ids to synthetix networks
export const WEB3_ONBOARD_TO_NETWORK: { [key: string]: Network } = {
	'0x1': { id: 1, name: 'mainnet' }, // Ethereum (mainnet)
	'0xa': { id: 10, name: 'mainnet-ovm', useOvm: true }, // Optimism (mainnet)
	'0x2a': { id: 42, name: 'kovan' }, // Ethereum Kovan (testnet)
	'0x45': { id: 69, name: 'kovan-ovm', useOvm: true }, // Optimism Kovan (testnet)
};

// Convert synthetix networks chains ids to web3-onboard chain ids
export const NETWORK_TO_WEB3_ONBOARD: { [key: string]: string } = {
	1: '0x1', // Ethereum (mainnet)
	10: '0xa', // Optimism (mainnet)
	42: '0x2a', // Ethereum Kovan (testnet)
	69: '0x45', // Optimism Kovan (testnet)
};

// Map web3-onboard L1 chain ids to L2 chain ids
export const MAP_L1_TO_L2_NETWORKS: any = {
	'0x1': '0xa',
	'0x2a': '0x45',
};

// Map web3-onboard L2 chain ids to L2 chain ids
export const MAP_L2_TO_L1_NETWORKS: any = {
	'0xa': '0x1',
	'0x45': '0x2a',
};

export const initOnboard = init({
	wallets: [injected, ledger, coinbase, trezor, walletConnect, gnosis, portis, torus],
	chains: [
		{
			id: '0x1',
			token: 'ETH',
			label: 'Ethereum',
			rpcUrl: getInfuraRpcURL(1),
		},
		{
			id: '0xa',
			token: 'ETH',
			label: 'Optimism',
			rpcUrl: getInfuraRpcURL(10),
		},
		{
			id: '0x2a',
			token: 'KOV',
			label: 'Ethereum Kovan',
			rpcUrl: getInfuraRpcURL(42),
		},
		{
			id: '0x45',
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
	accountCenter: {
		desktop: {
			enabled: false,
		},
	},
});
