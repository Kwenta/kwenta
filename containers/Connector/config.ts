import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import ledgerModule from '@web3-onboard/ledger';
import walletLinkModule from '@web3-onboard/walletlink';
import trezorModule from '@web3-onboard/trezor';
import walletConnectModule from '@web3-onboard/walletconnect';
import gnosisModule from '@web3-onboard/gnosis';
import portisModule from '@web3-onboard/portis';
import torusModule from '@web3-onboard/torus';

const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const EMAIL = 'info@synthetix.io';
const APP_URL = 'https://www.synthetix.io';

const injected = injectedModule();
const ledger = ledgerModule();
const walletLink = walletLinkModule();
const trezor = trezorModule({ email: EMAIL, appUrl: APP_URL });
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();
const portis = portisModule({ apiKey: process.env.NEXT_PUBLIC_PORTIS_APP_ID || '' });
const torus = torusModule();

// Note: There is no dark mode feature provided yet.
export const initWeb3Onboard = init({
	wallets: [
		injected, // Injected wallets refers to wallet browser extensions such as MetaMask.
		ledger,
		walletLink, // WalletLink refers to the Coinbase Wallet.
		trezor,
		walletConnect,
		gnosis,
		portis,
		torus,
	],
	chains: [
		{
			id: '0x1',
			token: 'ETH',
			label: 'Ethereum Mainnet',
			rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
		},
		{
			id: '0x3',
			token: 'tROP',
			label: 'Ethereum Ropsten Testnet',
			rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
		},
		{
			id: '0x4',
			token: 'rETH',
			label: 'Ethereum Rinkeby Testnet',
			rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
		},
		{
			id: '0x38',
			token: 'BNB',
			label: 'Binance Smart Chain',
			rpcUrl: 'https://bsc-dataseed.binance.org/',
		},
		{
			id: '0x89',
			token: 'MATIC',
			label: 'Matic Mainnet',
			rpcUrl: 'https://matic-mainnet.chainstacklabs.com',
		},
		{
			id: '0xfa',
			token: 'FTM',
			label: 'Fantom Mainnet',
			rpcUrl: 'https://rpc.ftm.tools/',
		},
	],
	appMetadata: {
		name: 'Kwenta',
		icon: '../../public/images/favicon.svg',
		logo: '../../public/images/favicon.svg', // TODO: Change the value to use the Kwenta logo
		description:
			'Gain exposure to cryptocurrencies, forex, equities, indices, and commodities on Ethereum with zero slippage.',
		gettingStartedGuide: 'https://kwenta.io/',
		explore: 'https://kwenta.io/',
		recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
	},
});
